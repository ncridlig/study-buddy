import sys
import os
from pathlib import Path
from setuptools import find_packages, setup

package_dir = Path(__file__).parent
sys.path.append(str(package_dir))

requirements_path = package_dir / "requirements.txt"
with open(requirements_path) as fid:
    requirements = [l.strip() for l in fid.readlines()]

cuda_available = False
metal_available = False

# Allow overrides from environment variables (set "1" for true)
if os.getenv("STUDY_FRIEND_CUDA") is not None:
    cuda_available = os.getenv("STUDY_FRIEND_CUDA") in ("1", "true", "True")
if os.getenv("STUDY_FRIEND_METAL") is not None:
    metal_available = os.getenv("STUDY_FRIEND_METAL") in ("1", "true", "True")

# Filter requirements based on availability
filtered_requirements = []
for req in requirements:
    if req.startswith("mlx-vlm") and not metal_available:
        continue
    if req.startswith("bitsandbytes") and not cuda_available:
        continue
    filtered_requirements.append(req)

setup(
    name="study_friend",
    version="1.0.1",
    description="AI tools to help you study better. No need of internet.",
    author_email="ncridlig@gmail.com",
    author="Nicolas Cridlig",
    url="https://github.com/ncridlig/study-friend",
    license="MIT",
    install_requires=filtered_requirements,
    packages=find_packages(where="."),
    python_requires=">=3.11",
    entry_points={
        "console_scripts": [
            "study_friend.query = study_friend.query:main",
            "study_friend.convert = study_friend.convert:main",
        ]
    },
)