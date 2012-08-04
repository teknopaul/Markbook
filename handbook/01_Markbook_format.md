
# Markbook Format

This page defines the Markbook format, which is a trivial extension of Markdown.

## Overview

A Markbook is essentially a directory or directories of Markdown files that are compiled into a book.

Just as the simplest Markdown file, is a plain text file containing written text, the simplest Markbook is just a directory containing Markdown files.  The Markbook format extends this with some simple templates and metadata for the book when converted to HTML.
Each Markbook should have its own root directory, and may have one level of sub-directories for the sections or chapters.
Naming conventions outlined here define how the book is compiled from the pages.

The format is designed so that the `.md` files can be read as text files. Meta data files have a `.` prefix so they are hidden from view when reading the book as text files.

Thus tying `ls` on the command line gives you the table of contents for the book or the chapter.

`.html` files can be generated from the `.md` files. If a hidden HTML file `.*.html` exists it can be used to override the generation of files from Markdown or meta data files.  For example a `toc.html` file is generated for each chapter unless a `.toc.html` exists, in which case the `.toc.html` takes precedence.

`.md` files contain the book's content, all formatting should be only in markdown format and HTML should be excluded where ever possible and where ever it interferes with readability of the text. It should be assumed that md files will be read as text.

`.mb` files are Markbook meta-data files, containing, for example, author and chapter title and any additional data about the book.

## Page syntax
	
The syntax of a page is Markdown and Markdown.pl will be used to convert the content to HTML body text, but some additional rules apply.

The first level one heading marked with a # symbol is considered the title of the page and will appear in the table of contents.
Titles should be plain text, no links bold or other Markdown formatting should be added to the title.

The first line of text after the title terminated by a new line `\n` is considered the summary text. The summary text is rendered in the table of contents this is a similar protocol to that used by JavaDoc, where the first line up to a full stop defines the summary, in Markbook the terminator is a new line, this enables multiple sentences in the synopsis but only one paragraph.
Summary text should be plain text, but additionally code and * bold formats from Markdown are supported.

For example.

    # My Page Title
    
    This is the summary text that appears in the toc.
    
    And then the page continues...

Markdown `*.md` files should only contain content, `*.html` files can be used for formatting. 
For example `<div class="container-960">` is valid markdown content but should be excluded from the md files and placed in .head.html which is used when rendering the HTML.

## Table of Contents

For each directory a table of contents `toc.html` is generated, the toc is named `index.html` if there is not an index file generated from either `.index.md` or `.index.html`.

Markdown files that start with an underscore `_` are considered private and are not added to the toc. They can be used to link references boot-notes or additional content that is not to form part of the indexes.

The pages and chapters are ordered alphabetically according to the file names in the toc. Prefixes to the file and directory names with numbers to control ordering of the pages within a section.

for example.

    00_Overview.md
    01_Chapter_one/
    02_Chapter_two/
    99_Credits.md

## Meta data files

The sections defines the additional hidden files that can be created and used when generating the HTML. All of these files are optional.

### Root directory meta data files

 * `.book.mb` - Meta data, contains book title, synopsis, author, copyright, shortname, and arbitrary name/value pairs.
 * `.index.html` - An HTML cover page, will be used unchanged.
 * `.index.md` - A Markdown file used to generate an HTML cover page.  If neither index exists the generated toc is used for the `index.html` page.
 * `.header.md` - Markdown content at the top of every page, may also rendered in text mode views, but may not if for example the user is reading with less or vi.
 * `.footer.md` - Markdown content at the foot of every page, may also rendered in text mode views.
 * `.head.html` - Top of the HTML page when HTML is generated, typically will contain the `<head>` block and open the `<html>` and `<body>` tags.
 * `.tail.html` - Bottom of the HTML page, typically will close the `<body>` and `<html>` tags.

### Chapter meta data files

 * `.chapter.mb` - meta data, similar format to `.book.md`, contents override `.book.md` for the chapter.
 * `.index.html` - HTML chapter first page, if absent toc becomes index page.
 * `.header.md` - overrides books `.header.md` for this chapter.
 * `.footer.md` - overrides `.footer.md`.
 * `.head.html` - overrides `head.html`.
 * `.tail.html` - overrides `tail.html`.

It is recommended to add at least a `.chapter.mb` file so the generated table of contents has text, if it does not exist the name of the directory is used for the chapter title.

## mb format

Files with extension `.mb` are Markbook format files. They are Markdown files with limited content. 

There should be one level one header.
The should be a synopsis on a single line.
After a blank line there can be name value pairs in the format `name: value`

for example

    # Chapter One
    
    The introduction something to get you started with.
    
    author: teknopaul
    keywords: example, book, Markbook, markdown
    chapter_css: whitebackground

## File formats

All markdown files should be utf-8.

File names and paths should not contain spaces, use underscores instead.

## HTML formats

The HTML files .head.html and .tail.html are normal HTML files but they also can contain attributes to be replaced with content from teh meta data.

If the HTML files cointan a placeholder `@some_name@` this will be replaced with the value of the attribute `some_name` from the `.book.mb` or the `.chapter.mb` file when the HTML is generated.

Additionally the rparameters `root`, `path` and `date` are to be available during rendering.

 * root - This attribute contains either `./` or `../` and can be used in the `.head.html` and `.tail.html` files to create relative paths to images, css and other pages in the book.
 * path - This attribute contains the absolute path of the page being rendered.
 * date - Contains the current date in UTC format when the pages are being rendered.
