from setuptools import setup

"""
Vercel doesn't like installing new modules via pip (like yfinance),
so we package yfinance as our own custom module and tell Vercel
to install it via a local file.
"""

setup(
    name='my_package',
    version='0.1',
    py_modules=['my_module'],
    install_requires=[
        'yfinance',
    ],
)
