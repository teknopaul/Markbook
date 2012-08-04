
var Markbook = function() {

}

/**
 * Write out an HTML page, from HTML text or a Markdown file.
 */
Markbook.prototype.writePage = function(page, destPath, atts) {

	var date = new Date().toUTCString();
	$.setEnv("PAGE_PATH", destPath);
	
	binjs_exec('cat ' + page.headPath 
		+ ' | ./filter ' + page.bookPath + ' ' + (page.chapterPath ? page.chapterPath : '""') 
		+ ' "date:' + date + '"'
		+ ' "markdownPath:' + page.markdownPath + '"'
		+ this._formatAtts(atts)
		+ ' > ' + destPath);
	
	$.setEnv("F_PATH", page.headerPath);
	binjs_exec('test -f $F_PATH && perl ../lib/Markdown.pl $F_PATH >> ' + destPath);

	$.setEnv("F_PATH", page.markdownPath);
	if (page.markdownPath) {
		binjs_exec('perl ../lib/Markdown.pl $F_PATH >> ' + destPath);
	}
	else {
		$.setEnv("DATA", page.htmlText);
		binjs_exec('echo $DATA >> ' + destPath);
	}
	
	$.setEnv("F_PATH", page.footerPath);
	binjs_exec('test -f $F_PATH && perl ../lib/Markdown.pl $F_PATH >> ' + destPath);
	
	binjs_exec('cat ' + page.tailPath 
		+ ' | ./filter ' + page.bookPath + ' ' + (page.chapterPath ? page.chapterPath : '""') 
		+ ' "date:' + date + '"'
		+ ' "markdownPath:' + page.markdownPath + '"'
		+ this._formatAtts(atts)
		+ ' >> ' + destPath);
	
	$.info(5,"Generated", destPath);
}

/**
 * Write the table of contents which lists files and or subdirectories 
 */
Markbook.prototype.writeToc = function(page, toc, tocPath, atts) {

	var date = new Date().toUTCString();
	$.setEnv("TOC_PATH", tocPath);

	binjs_exec('cat ' + page.headPath
		+ ' | ./filter ' + page.bookPath + ' ' + (page.chapterPath ? page.chapterPath : '""') 
		+ ' "date:' + date + '"'
		+ this._formatAtts(atts)
		+ ' > "$TOC_PATH"');
	
	binjs_exec('echo "<h1>Table of contents</h1>" >> "$TOC_PATH"');
	
	binjs_exec('echo "<ul class=\\"markbooktoc\\">" >> "$TOC_PATH"');
		
	for (var i = 0 ; i < toc.length ; i++) {
	
		$.setEnv("TITLE", toc[i].title);
		$.setEnv("DEST", toc[i].dest);
		$.setEnv("SYNOPSIS", toc[i].synopsis);
		binjs_exec('echo \'<li class="idx"><a href="\'$DEST\'">\' $TITLE "</a> - $SYNOPSIS</li>" >> "$TOC_PATH"');
	
	}
	binjs_exec('echo "</ul>" >> "$TOC_PATH"');
	
	binjs_exec('cat ' + page.tailPath 
		+ ' | ./filter ' + page.bookPath + ' ' + (page.chapterPath ? page.chapterPath : '""') 
		+ ' "date:' + date + '"'
		+ this._formatAtts(atts)
		+ '  >> "$TOC_PATH"');
	
	$.info(6,"Generated", tocPath);
}
/**
 * Get the first H1 header
 */
Markbook.prototype.getTitle = function(file) {
	file.open("rb");
	var line = file.readString();
	while( line != null ) {
		if ( line.indexOf("# ") === 0 ) {
			file.close();
			return line.substring(2);
		}
		line = file.readString();
	}
	file.close();
	return file.name;
}
/**
 * Return the first bit of markdown text, up to the first blank line
 * after the # header row.
 */
Markbook.prototype.getIntro = function(file) {
	file.open("rb");
	var line = file.readString();
	var intro = "";
	while( line != null ) {
		if ( line.indexOf("# ") === 0 ) {
			intro = this._markupIntro( this._intro(file, i) );
			file.close();
			return intro;
		}
		line = file.readString();
	}
	file.close();
	return intro;
}

Markbook.prototype._intro = function(file) {
	var intro = "";
	var line = file.readString();
	while( line != null ) {
		if ( line.length === 1 && intro.length !== 0 && line === '\n') {
			return intro;
		}
		else {
			intro +=  line + " ";
		}
		line = file.readString();
	}
	return intro;
}
/**
 * Gets the attributes froma .mb file.
 */
Markbook.prototype.getAttributes = function(filedata) {
	var atts = {};
	var lines = filedata.split('\n');
	for ( var i = 0 ; i < lines.length ; i++ ) {
		if ( /^[a-zA-Z0-9-_]+:/.test(lines[i]) ) {
			var colonIdx = lines[i].indexOf(":");
			atts[lines[i].substring(0, colonIdx)] = lines[i].substring(colonIdx + 1);
		}
	}
	return atts;
}

Markbook.prototype.getBookAttributes = function(srcPath) {
	var bookMetaFile = new File(srcPath + "/.book.mb");
	if ( bookMetaFile.exists ) {
		return markbook.getAttributes(bookMetaFile.read());
	}
	else return {};
}

Markbook.prototype.getChapterAttributes = function(srcPath) {
	var chapterMetaFile = new File(srcPath + "/.chapter.mb");
	if ( chapterMetaFile.exists ) {
		return markbook.getAttributes(chapterMetaFile.read());
	}
	else return {};
}
/**
 * Merge all attributes for a file, this is achieved by taking the 
 * .book.mb adttibutes and adding and overriding any .chapter.mb attributes
 * the atdding and overriding any .MyPage.mb attributes
 */
Markbook.prototype.getAllAttributes = function(bookPath, chapterPath) {

	var atts = this.getBookAttributes(bookPath);
	atts.root = "./";
	atts.path = bookPath;
	
	if ( chapterPath ) {
		// override book atts with chapter atts
		var chapterAttributes = this.getChapterAttributes(chapterPath);
		for ( att in chapterAttributes) {
			atts[att] = chapterAttributes[att];
		}
		atts.root = "../";
		atts.path = chapterPath;
	}
	return atts;
}

Markbook.prototype.cloneAttributes = function(origAtts) {
	var atts = {};
	for ( att in origAtts) {
		atts[att] = origAtts[att];
	}
	return atts;
}
/**
 * Markup just bold and code, * and `
 */
Markbook.prototype._markupIntro = function(text) {
	var buffer = "";
	var inCode = false;
	var inBold = false;
	for (var i = 0 ; i < text.length ; i++) {
		var c = text.charAt(i);
		if ('*' == c) {
			if ( inCode ) {
				buffer += c;
			}
			else {
				buffer += (inBold ? "</b>" : "<b>");
				inBold = !inBold;
			}
		}
		if ('`' == c) {
			buffer += (inCode ? "</code>" : "<code>");
			inCode = !inCode;
		}
		else buffer += c;
	}
	return buffer;
}

Markbook.prototype._formatAtts = function(atts) {
	if (! atts) return "";
	
	var buffer = "";
	for (att in atts) {
		buffer += (' "' + att + ':' + atts[att] + '"');
	}
	return buffer;
}

/*
 * Object represents a page in the book
 */
var MarkbookPage = function() {
	this.bookPath;
	this.chapterPath;
	// optional
	this.headerPath;
	this.footerPath;
	// one of
	this.markdownPath;
	this.htmlText;
	// required
	this.headPath;
	this.tailPath;
}
MarkbookPage.prototype.clearData = function() {
	this.markdownPath = undefined;
	this.htmlText = undefined;
} 