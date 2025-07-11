import sys
from pathlib import Path
from setuptools import find_packages, setup

package_dir = Path(__file__).parent
sys.path.append(str(package_dir))

requirements_path = package_dir / "requirements.txt"
with open(requirements_path) as fid:
    base_requirements = [l.strip() for l in fid.readlines()]

setup(
    name="study_friend",
    version="1.0.1",
    description="AI tools to help you study better. No need of internet.",
    author_email="ncridlig@gmail.com",
    author="Nicolas Cridlig",
    url="https://github.com/ncridlig/study-friend",
    license="MIT",
    install_requires=base_requirements,
    extras_require={
        "cuda": ["bitsandbytes>=0.45.2"],
        "metal": ["mlx-vlm>=0.1.14"],
    },
    packages=find_packages(where="."),
    python_requires=">=3.11",
    entry_points={
        "console_scripts": [
            "study_friend.query = study_friend.query:main",
            "study_friend.convert = study_friend.convert:main",
        ]
    },
)