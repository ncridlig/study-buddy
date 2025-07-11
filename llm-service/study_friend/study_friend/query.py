import argparse
import os
import re
import numpy as np
from natsort import natsorted
from tqdm import tqdm
from ast import literal_eval

from .utils import (
    add_argument_common,
    add_argument_convert,
    add_argument_query,
    prompt_injection,
    standardize_math_formulas,
    print_args
)
from .models import (
    load_model,
    query
)
from .convert import (
    convert_pdfs_to_images
)

def group_images(subDirName, group_size=3, verbose=False):
    """ 
    This function groups images in a directory into windows of a specified size.
    Args:   subDirName (str): The name of the directory from where to group images.
            group_size (int): The size of the window to group images.
    Return: list of grouped file paths
    """
    # ensure absolute path
    subDirName = os.path.abspath(subDirName)
    # skip if not file
    if not os.path.isdir(subDirName):
        return []
    if verbose:
        print(f"Grouping images in {subDirName}:")
    # read dir files
    images = os.listdir(subDirName)
    images = natsorted(images)
    # save images number
    image_size = len(images)
    # get indices windowed by group_size
    windows = np.arange(image_size+group_size-(image_size)%group_size).reshape((-1,group_size))
    # windowing
    grouped_files = []
    for window in windows:
        files = []
        for i in window:
            # safe check for idx to be in range
            if i >= image_size: 
                break
            # append files
            files += [os.path.join(subDirName,images[i])]
        grouped_files += [files]
    return grouped_files

def query_images(grouped_files, engine, model, processor, config, title_prompt, question_prompt, answer_prompt, counter, singularities, pluralities, output_file, verbose=False):
    """
    This function queries an image processing model to extract titles and questions from grouped images, then generates answers based on these questions.
    Args:   grouped_files (list): A list of lists containing paths to the images in each group.
                             Each inner list represents a group of files that belong together.
            model: The AI model used for generating text from images or text prompts.
            processor: The tokenizer or processing function used by the model.
            config: Configuration settings for the model and its preprocessing steps.
            title_prompt (str): A prompt to generate the title of the slide-pack.
            question_prompt (str): A prompt to generate questions based on the image content.
            answer_prompt (str): A template string that includes a placeholder for the question.
                             It is used to generate answers based on specific questions.
            output_file (str): The path to the file where the generated text will be appended.
            verbose (bool, optional): If set to True, additional information will be printed during processing. Default is False.
    Returns: None
    """
    with open(output_file, "a") as wfile:
        # extract title
        if len(grouped_files) > 0 and len(grouped_files[0]) > 0:
            # query model - retrieve title of slide-pack
            title = query(engine, model, processor, config, title_prompt, [grouped_files[0][0]], verbose=verbose)
            if verbose:
                print(f"Model title response: {title}")
            # print the files to have a reference
            wfile.write(f"# {title}\n")
        # extract question-answers
        for images in tqdm(grouped_files, leave=False, desc=f"Questions"):
            # local question prompt for these images
            _question_prompt = question_prompt
            # extract image paths
            if verbose:
                print(f"Querying model on: {images}")
            # pre-process the question_prompt if needed
            if len(images) == 1:
                # singular injection - makes question prompt singular to avoid non-aligned answers
                _question_prompt = prompt_injection(_question_prompt, pluralities, singularities)
            # counter injection - add images counts in question prompt
            _question_prompt = prompt_injection(_question_prompt, [counter], [str(len(images))])
            # query model - retrieve question on slides
            output = query(engine, model, processor, config, _question_prompt, images, verbose=verbose)
            # write the files to have a reference
            wfile.write(f"\nFiles: [{', '.join(images)}]"+"\n")
            # loop over the output lines
            for out in tqdm(output.split("\n"), leave=False, desc="Answers  "):
                # check if line contains a question
                if (question := re.findall("[\\w\\d].*\\?$", out)) != []:
                    question = question[0]
                    # query model - retrieve answer on question
                    answer = query(engine, model, processor, config, answer_prompt.format(question=question), images, verbose=verbose)
                    if verbose:
                        print(f"Model question: {question}")
                        print(f"Model answer: {answer}")
                    # post-process math sections
                    answer = standardize_math_formulas(answer)
                    # write to file
                    wfile.write(question+"\n")
                    wfile.write(answer+"\n")
                # otherwise print the line
                else:
                    wfile.write(out+"\n")

def beautify_markdown(temp_file, output_file, verbose = False):
    """
    This function processes a Markdown file to format it according to specific rules and writes the formatted content to another file.
    Args:   temp_file (str): The path to the input Markdown file that needs to be processed.
            output_file (str): The path to the output file where the formatted content will be saved.
            verbose (bool, optional): If set to True, the function will print additional information during processing. Default is False.
    Returns: None
    """
    lines_out = []
    with open(temp_file,"r") as rfile:
        with open(output_file,"w") as wfile:
            while (line := rfile.readline()) != "" :
                quest = re.findall("[^\\d. ].*\\?$", line)
                slide = re.search("(### Slide \\d)(.*)$", line)
                files = re.findall("Files: \\[.*$", line)
                sep = re.findall("---$", line)
                # add ":question:" mark before each question
                if quest != [] and not slide:
                    quest = "\n:question: " + quest[0] + "\n\n"
                    wfile.write(quest)
                    lines_out.append(quest)
                # remove Slide number (misleading since always 1/2/... for each group)
                elif slide:
                    slide = "### Slide " + slide.group(2)
                    wfile.write(slide)
                    lines_out.append(slide)
                # add "---" before each group (i.e. before each Files:)
                elif files != []:
                    files = "---\n\n" + files[0] + "\n"
                    wfile.write(files)
                    lines_out.append(files)
                # remove unwanted "---"
                elif sep != []:
                    wfile.write("")
                    lines_out.append("")
                # line is ok - write it back
                else:
                    wfile.write(line)
                    lines_out.append(line)
    # delete temp file
    os.remove(temp_file)
    # join all lines into one string
    return "".join(lines_out)
            
def main(args=None):
    parser = argparse.ArgumentParser(description="Creates a file containing question and answers about pdfs slides.")
    add_argument_common(parser)
    add_argument_convert(parser)
    add_argument_query(parser)
    args = parser.parse_args(args)
    if args.verbose:
        print("Options:")
        print_args(args)
    # let's use a temp file to store raw responses
    temp_file = args.output_file + "_temp"
    # let's call the functions with the arguments
    pdf_input = literal_eval(args.dir) if args.dir.strip().startswith("[") else args.dir
    dirs = convert_pdfs_to_images(pdf_input, args.image_size, args.output_image) if args.image_dir == "" else [args.image_dir]
    # let's load the model
    model, processor, config = load_model(args.engine, args.model, args.verbose)
    # let's group images
    for d in tqdm(dirs, desc="Documents"):
        # group files
        grouped_files = group_images(d, args.group_size, args.verbose)
        # query model
        query_images(grouped_files, args.engine, model, processor, config, args.title_prompt, args.question_prompt, args.answer_prompt, args.counter_injector, args.singular_injectors, args.plural_injectors, temp_file, args.verbose)
    # let's make the file prettier
    markdown = beautify_markdown(temp_file, args.output_file)
    return markdown

if __name__ == "__main__":
    main()