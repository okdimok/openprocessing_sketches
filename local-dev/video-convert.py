#!/usr/bin/env python3
import argparse
from enum import Enum
import os
import shutil
import subprocess
from os.path import abspath, dirname, basename, splitext, isfile, isdir

def get_main_dir_filename_frames_dir(tar):
    main_dir = dirname(dirname(abspath(tar)))
    filename, _ = splitext(basename(tar))
    return main_dir, filename, f"{main_dir}/frames/{filename}.frames"


def process_tar(tar):
    print(tar)
    if not tar.endswith(tar):
        raise NameError(f"{tar} is not tar file")
    if not isfile(tar):
        raise FileNotFoundError(f"{tar} — no such file, maybe a dir?")
    path = dirname(abspath(tar))
    closest_dir = basename(path)
    if closest_dir != "tar":
        new_tar_dir = f"{path}/tar"
        os.mkdir(new_tar_dir)
        new_tar = f"{new_tar_dir}/{basename(tar)}"
        shutil.move(tar, new_tar)
        tar = new_tar
    
    main_dir, filename, frames_dir = get_main_dir_filename_frames_dir(tar)
    if not isdir(frames_dir):
        os.makedirs(frames_dir)
        subprocess.run(["tar", "-xf", tar, "-C", frames_dir])
    return tar

def default_process(args, tar, ext, dir_postfix=""):
    main_dir, filename, frames_dir = get_main_dir_filename_frames_dir(tar)
    output_dir = f"{main_dir}/{ext}"
    if dir_postfix: output_dir = f"{output_dir}_{dir_postfix}"
    os.makedirs(output_dir, exist_ok=True)
    output_file = f"{output_dir}/{filename}.{ext}"
    frames = f"{frames_dir}/{args.frames_format}"
    if isfile(output_file) and not args.overwrite:
        return None, None
    return frames, output_file


def process_webm(args, tar, scale=512, dir_postfix="", bv="-b:v 300k"):
    frames, output_file = default_process(args, tar, "webm", dir_postfix)
    if output_file is None: return

    os.system(f"ffmpeg -y -framerate 30 -f image2 -i {frames} \
            -c:v libvpx-vp9 -pix_fmt yuva420p \
            {bv} -pass 1 -vf scale=512:-1 -an -f null /dev/null && \
        ffmpeg -y -framerate 30 -f image2 -i {frames}\
             -c:v libvpx-vp9 -pix_fmt yuva420p \
            {bv} -pass 2 -vf scale={scale}:-1 {output_file}")

def process_webm_emoji(args, tar, scale=512, dir_postfix=""):
    process_webm(args, tar, 100, "emoji", "")

def process_mp4(args, tar):
    frames, output_file = default_process(args, tar, "mp4")
    if output_file is None: return
    
    # https://trac.ffmpeg.org/wiki/Encode/H.264
    os.system(f"ffmpeg -y -framerate 30 -f image2 -i {frames} \
                -c:v libx264 -preset slow -tune animation -pix_fmt yuv420p \
                -vf scale=512:-1 {output_file}")

def process_webp(args, tar):
    frames, output_file = default_process(args, tar, "webp")
    if output_file is None: return
    
    # https://gist.github.com/witmin/1edf926c2886d5c8d9b264d70baf7379
    os.system(f"ffmpeg -y -framerate 30 -f image2 -i {frames} \
                -vcodec libwebp -filter:v fps=fps=30 -lossless 1 -loop 0 \
                -preset default -an -vsync 0 {output_file}")

def process_gif(args, tar):
    frames, output_file = default_process(args, tar, "gif")
    if output_file is None: return
    
    # https://engineering.giphy.com/how-to-make-gifs-with-ffmpeg/
    fframes = "%07d"
    if fframes in frames:
        frames=frames.replace(fframes, "*")
    print ("GIF limitations: delay is 30 ms instead of 33.333")
    os.system(f"convert -delay 3 -loop 0 $frames {output_file}")



def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("-f", "--format", help="target format for the output", type=str, required=True, nargs="+")
    parser.add_argument("-y", "--overwrite", help="if one should overwite the video", action="store_true")
    parser.add_argument("--frames-format", type=str, default="%07d.png")
    parser.add_argument(dest='tars', nargs='+')
    args = parser.parse_args()
    return args

def run(args):
    for fmt in args.format:
        processor_name = f"process_{fmt}"
        if processor_name not in globals().keys():
            raise (NotImplementedError(f"{args.format} is not implemeted"))

    for fmt in args.format:
        processor_name = f"process_{fmt}"
        for tar in args.tars:
            tar = process_tar(tar)
            globals()[processor_name](args, tar)
    

if __name__ == "__main__":
    args = parse_args()
    run(args)

