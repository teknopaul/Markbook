# The Markbook script

The Markbook files are converted to HTML using a script called `bin/markbook`.

The script takes two arguments the source directory containing the Markdown files, and the destination directory, which should already exist.

    bin/markbook example_book example_output

The script performs the following operations.

 * Convert all `md` files to `html` appending headers and footers and replacing variables from the meta data.
 * Create tocs.
 * Copies static content from `.img/` and `.css/` to the destination directories `img/` and `css/`.
 * Copies any `html` files overriding the generated files.

A Markdown page is generated as follows.
 
 * cat the `.head.html` file to the new destination file, created with extension `.html`.
 * Convert the `.header.md` file from Markdown to HTML and append it to the HTML file.
 * Convert the main Markdown data from Markdown to HTML and append it to the file.
 * Convert the `.footer.md` file from Markdown to HTML and append it to the file.
 * cat the `.tail.html` file appending to the destination file.

All files are optional, if `.head.html` or `.tail.html` do not exists defaults from `markbook/lib/html` are used.

If `.css/` does not exist `markbook/lib/css` is copied to the output.

If `.img/` does not exist `markbook/lib/css` is copied to the output.
 