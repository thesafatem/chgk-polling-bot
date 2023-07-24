interface String {
    bold(): string;
    italic(): string;
    underline(): string;
    preformat(): string;
    mention(userId: number): string;
    link(url: string): string;
}

String.prototype.bold = function() {
    return '<b>' + this + '</b>';
}

String.prototype.italic = function() {
    return '<i>' + this + '</i>';
}

String.prototype.underline = function() {
    return '<u>' + this + '</u>';
}

String.prototype.preformat = function() {
    return '<pre>' + this + '</pre>';
}

String.prototype.mention = function(userId: number) {
    return `<a href="tg://user?id=${userId}>` + this + '</a>';
}

String.prototype.link = function(url: string) {
    return `<a href="${url}">` + this + '</a>'; 
}