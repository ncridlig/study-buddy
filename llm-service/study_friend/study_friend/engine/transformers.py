import torch
from PIL import Image
from transformers import Qwen2_5_VLForConditionalGeneration
from transformers import AutoProcessor
from transformers import GenerationConfig
from transformers import BitsAndBytesConfig

# Inspired by:
# https://github.com/huggingface/transformers/pull/35569/files

# CONSTANTS
DEFAULT_TRANSFORMERS_TEMPLATE = lambda images, prompt: [
    {
        "role":"user",
        "content":[{"type":"image"} for _ in images] + [{"type":"text", "text":prompt}]
    }
]

def load_model_transformers(model_path : str, metadata_path : str, device : torch.device, verbose=False):
    """
    This function loads an Transformers-specific AI models from the specified path and returns it along with its associated configuration.
    Args:   model_path (str): The path to the directory where the model files are stored.
            verbose (bool, optional): If set to True, additional information will be printed during the loading process. Default is False.
    Returns:    model (object): The loaded AI model.
                processor (object): The tokenizer or processing function used by the model.
                config (object): Configuration settings for the model.
    """
    model_kwargs = {}

    if torch.cuda.is_available():
        if verbose:
            print(f"Using CUDA GPU: {torch.cuda.get_device_name(0)}")
        model_kwargs['torch_dtype'] = torch.bfloat16
        model_kwargs['device_map'] = "auto"
    else:
        if verbose:
            print(f"No CUDA GPU available using {device.type}. Loading model with 8-bit quantization.")
        # For Mac and CPU 
        model_kwargs['torch_dtype'] = torch.float16
        model_kwargs['device_map'] = device.type

    # Load the model
    model = Qwen2_5_VLForConditionalGeneration.from_pretrained(model_path, trust_remote_code=True, ignore_mismatched_sizes=True, **model_kwargs)
    processor = AutoProcessor.from_pretrained(metadata_path, use_fast=True)
    config = GenerationConfig.from_pretrained(metadata_path)
    return model, processor, config

def query_transformers(model, processor, config, prompt, images, temperature = 0.1, max_tokens = 999, device = torch.device, verbose = False):
    """
        This function queries a Transformers-specific model with a prompt and images.
        Args:
            model (object): The loaded model to query with.
            processor (Processor): The processor to use for the model.
            config (Config): The config
        Returns: 
            output (str): The generated text
    """
    # safe-check: images must be presets
    if len(images) < 1:
        return ""
    # load images
    images = [Image.open(im) for im in images]
    # Apply chat template
    text_prompt = processor.apply_chat_template(DEFAULT_TRANSFORMERS_TEMPLATE(images, prompt), add_generation_prompt=True)
    if verbose:
        print(f"Text prompt : {text_prompt}")
    # Preprocess input
    inputs = processor(text=[text_prompt], images=images, padding=True, return_tensors="pt")
    inputs = inputs.to(device)
    # set geration config parameters
    config.temperature = temperature
    # Inference - Generation of the output
    output_ids = model.generate(**inputs, max_new_tokens=max_tokens, generation_config=config)
    # Batch decoding
    generated_ids = [output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, output_ids)]
    output = processor.batch_decode(generated_ids, skip_special_tokens=True, clean_up_tokenization_spaces=True)
    return output[0]