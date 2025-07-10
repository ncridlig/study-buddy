import pdf2image
import os
import argparse
import PIL
from tqdm import tqdm

from .utils import (
    add_argument_common,
    add_argument_convert
)
def save_images(dirName, images, imageNames, image_size, verbose = False):
    """ 
    This function saves images to a directory.
    Args: dirName (str): The name of the directory to save images.
            images (list): A list of images to save.
            imageNames (list): A list of image names.
            resizeFactor (int): The factor to resize images by. 
    """
    # create if dir does not exists
    try:
        os.makedirs(dirName)
    except:
        if verbose:
            print(f"Directory \"{dirName}\" already exists")
    finally:
        # save images in dir
        for i in range(len(images)):
            # create file name
            fname = os.path.join(dirName, f"{imageNames[i]}.jpeg")
            # calculate best resizeFactor
            resizeFactor = max(1., max(images[i].size)/image_size)
            # if images are too large - let's resize
            images[i] = images[i].resize((int(images[i].size[0]//resizeFactor), int(images[i].size[1]//resizeFactor)), PIL.Image.LANCZOS)
            images[i].save(fname)

def convert_pdfs_to_images(pdf_dir, image_size, img_dir, verbose = False):
    """
    Converts all PDF files in `pdf_dir` to images and saves them under `img_dir`,
    in subdirectories named after each PDF (without the extension).

    Args:
        pdf_dir (str): Directory containing input PDFs.
        image_size (int): Target image width (resizes each image).
        img_dir (str): Base directory to save the output images.
        verbose (bool): Whether to print detailed logs.

    Returns:
        list[str]: List of full output directories where images were saved.
    """
    # save output dirs
    output_dirs = []
    if not os.path.exists(img_dir):
        os.makedirs(img_dir)

    # Determine the list of PDF files
    if isinstance(pdf_dir, str) and os.path.isdir(pdf_dir):
        pdf_files = [
            os.path.join(pdf_dir, f)
            for f in os.listdir(pdf_dir)
            if f.lower().endswith(".pdf")
        ]
    elif isinstance(pdf_dir, list):
        pdf_files = [f for f in pdf_dir if f.lower().endswith(".pdf") and os.path.isfile(f)]
    else:
        raise ValueError("pdf_dir must be a directory path or a list of PDF file paths.")

    # iterate over pdfs
    for file_path in tqdm(pdf_files, desc="Pdf2images"):
        if verbose:
            print(f"Converting {file_path}")
        # subdir is just filename without filetype
        subDirName = os.path.splitext(os.path.basename(file_path))[0]
        output_subdir = os.path.join(img_dir, subDirName)
        os.makedirs(output_subdir, exist_ok=True)
        output_dirs += [output_subdir]
        # convert slides
        images = pdf2image.convert_from_path(file_path)
        # create images names
        imageNames = [str(i) for i in range(len(images))]
        # save images
        save_images(output_subdir, images, imageNames, image_size, verbose)
    return output_dirs

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert pdfs to images.")
    add_argument_common(parser)
    add_argument_convert(parser)
    args = parser.parse_args()
    # let's call the functions with the arguments
    convert_pdfs_to_images(args.pdf_dir, args.image_size, args.img_dir, args.verbose)