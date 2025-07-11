import torch
from enum import StrEnum

# CONSTANT - ENGINEs
class Engine(StrEnum):
    Transformers = "transformers",
    MLX_VLM = "mlx_vlm"

# CONSTANTS - device
DEVICE_IS_METAL = torch.backends.mps.is_available()
DEVICE_IS_CUDA = torch.cuda.is_available()
DEVICE_MEMORY_GB = (torch.mps.recommended_max_memory() if DEVICE_IS_METAL else torch.cuda.memory.mem_get_info()[1]) / (1<<30) # device memory in GB

# CONSTANTS - query
DEFAULT_IMAGE_SIZE = 500 #? if DEVICE_MEMORY_GB > 4. else 400 # best image size for 3B/7B models
DEFAULT_GROUP_SIZE = 3 if DEVICE_MEMORY_GB > 4. else 1
DEFAULT_VERBOSE = False
if DEVICE_IS_METAL:
    if DEFAULT_VERBOSE: print("Apple MPS device detected. Selecting 7B MLX-quantized model.")
    DEFAULT_MODEL = "mlx-community/Qwen2.5-VL-7B-Instruct-4bit"

elif DEVICE_IS_CUDA:
    if DEFAULT_VERBOSE: print("NVIDIA CUDA device detected.")
    DEFAULT_MODEL = "unsloth/Qwen2.5-VL-3B-Instruct-unsloth-bnb-4bit" #"Qwen/Qwen2.5-VL-7B-Instruct" #"unsloth/Qwen2.5-VL-7B-Instruct-unsloth-bnb-4bit" "unsloth/Qwen2.5-VL-7B-Instruct-unsloth-bnb-4bit" # other models which are slower but smarter

else:
    if DEFAULT_VERBOSE: print("No accelerator detected. Selecting 3B model for CPU.")
    DEFAULT_MODEL = "unsloth/Qwen2.5-VL-3B-Instruct-unsloth-bnb-4bit"
DEFAULT_TITLE_PROMPT = "\nWhat is the slide title and slide subtitle (if not present leave it blank) of the slide? Answer concisely using the following template and nothing else:\n<slide_title> - <slide_subtitle>"
DEFAULT_COUNTER_INJECTOR = "<<number_of_slides>>"
DEFAULT_PLURALITY_INJECTORS = ['''<Slide's number>''', f'for each of the {DEFAULT_COUNTER_INJECTOR} slide']
DEFAULT_SINGULARITY_INJECTORS = ['1' , '']
DEFAULT_QUESTION_PROMPT = f"\nExample:\n### Slide {DEFAULT_PLURALITY_INJECTORS[0]}: <Slide's title>\n\n\n1. <question 1>?\n2. <question 2>?\n\nWhat is the subject of the slides? Generate me 2 different questions {DEFAULT_PLURALITY_INJECTORS[1]} about the charts and concepts, don't provide any answer. Use the template of the example above {DEFAULT_PLURALITY_INJECTORS[1]}."
DEFAULT_ANSWER_PROMPT = "\nLook at the images and briefly answer the following question:\n{question}"
OUTPUT_FILE = "output.md"
DEFAULT_TEMPERATURE = 0.1
DEFAULT_MAX_TOKENS = 999
DEFAULT_ENGINE = Engine.MLX_VLM if DEVICE_IS_METAL else Engine.Transformers
DEFAULT_MATH_REGEX = r"""( *\\\[[\s\S]+?\\\]| *\\\([\s\S]+?\\\))"""

# CONSTANTS - models
DEFAULT_MODEL_FINETUNING_NAMES = ["base","instruct","coder"]
DEFAULT_MODEL_REGEX = '(.*)/(.*)-(\\d*[B|M])(-)?({model_finetunigs})?'
