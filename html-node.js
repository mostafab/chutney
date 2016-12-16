const HTMLTreeNode = function(tag, text, attrs, children = []) {
    this.tag = tag
    this.text = text
    this.attrs = attrs
    this.children = children
}

HTMLTreeNode.prototype.addChild = function(node) {
    this.children.push(node)
} 

exports.HTMLTreeNode = HTMLTreeNode