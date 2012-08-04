 
# Introduction

Markbooks are just a directory of Markdown files.

Any files in the root directory with the extension `.md` will be generated in the output and referenced in the Table of Contents.
Markdown files whose names start with underscore are not entered in the toc but are generated. 

You can create sub-directories of Markdown files and it will be treated as a chapter in the book.

The Markbook can be converted to an HTML website by running the markbook script, which renders all the pages and creates indexes and a cover page.

That's all you need to do for a Markbook, but some bells and whistles can be applied by creating hidden files in the same directory structure.  The extra files are hidden so that the Markdown files can be browsed on the command line and viewed with a text editor. This is the main benefit of Markdown as a format, you don't have to generate HTML to read Markdown files the source files are nicely formatted text files already.

The [Markbook format](01_Markbook_format.html) page has more details.

