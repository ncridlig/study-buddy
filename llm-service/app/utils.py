from app.settings import settings
import os

def validate_files_exist(file_paths):
    """
    To mimic the behavior of LLM Q&A generation, thi function
    Checks whether all provided file paths exist inside the base_dir
    """
    missing = []
    for path in file_paths:
        if not os.path.isfile(f"{settings.BASE_DIR}/{path}"):
            raise Exception("File not found: {}".format(path))
    return True