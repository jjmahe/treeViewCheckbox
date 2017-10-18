

function checkboxPureInit( treeId , selectionItem ){
	var checkboxTree = {
		tree: $(treeId),
		topLevel : $(treeId).treeView("getNodes",$(treeId + "_0"))[0] ,
		pageItem : selectionItem
	} ;

	updateChecked( checkboxTree.topLevel ) ;
	
	var nodeAdapter = checkboxTree.tree.treeView('getNodeAdapter') ;
	
	nodeAdapter.renderNodeContent = function( node, out, options, state ) {
		if(typeof node.checkedStatus == "undefined"){
			node.checkedStatus = {
				leaves: 0 ,
				checkedLeaves: 0
			} ;
		}
		out.markup("<span ")
			.attr("class",'treeSelCheck' + (node.checkedStatus.checkedLeaves == 0 ? "" : 
											node.checkedStatus.checkedLeaves == node.checkedStatus.leaves ? " fullChecked" : " partChecked")
											)
			.markup(">")
			.markup("</span>"); // this is the checkbox - its not a real checkbox input
		// the rest of this code is essentially a copy of what is in widget.treeView.js function renderTreeNodeContent
		if ( this.getIcon ) {
			icon = this.getIcon( node );
			if ( icon !== null ) {
				out.markup( "<span" ).attr( "class", options.iconType + " " + icon ).markup( "></span>" );
			}
		}
		link = options.useLinks && this.getLink && this.getLink( node );
		if ( link ) {
			elementName = "a";
		} else {
			elementName = "span";
		}
		out.markup( "<" + elementName + " tabIndex='-1' role='treeitem'" )
			.attr( "class",options.labelClass + " level"+state.level)
			.optionalAttr( "href", link )
			.attr( "aria-level", state.level )
			.attr( "aria-selected", state.selected ? "true" : "false" )
			.optionalAttr( "aria-disabled", state.disabled ? "true" : null )
			.optionalAttr( "aria-expanded", state.hasChildren === false ? null : state.expanded ? "true" : "false" )
			.markup( ">" )
			.content( this.getLabel( node ) )
			.markup( "</" + elementName + ">" ) ;
		
		
	};
	
	checkboxTree.tree.treeView("refresh"); // refresh so that all the nodes are redrawn with custom renderer

	checkboxTree.tree.on("click", ".treeSelCheck", function(event) { // make that "checkbox" span control the selection
			var nodeContent$ = $(event.target).closest(".a-TreeView-content") ; // HTML Node
			var modelNode = checkboxTree.tree.treeView("getNodes",nodeContent$)[0] ;
			var selection = [] ;
			
			if(modelNode.checkedStatus.checkedLeaves > 0 ) {
				clearSubTree(modelNode) ;
			}
			else {
				addSubTree(modelNode) ;
			}
			updateChecked(checkboxTree.topLevel,selection) ;
			$s(checkboxTree.pageItem,selection.join(':')) ;
			
			/* update parent checboxex */
			while( modelNode != null ){
				treeNode = checkboxTree.tree.treeView("getTreeNode",modelNode) ;
				$(treeNode).children(".treeSelCheck").removeClass("fullChecked").removeClass("partChecked");
				if(modelNode.checkedStatus.checkedLeaves > 0 ){
				   if(modelNode.checkedStatus.leaves == modelNode.checkedStatus.checkedLeaves ) {
					   $(treeNode).children(".treeSelCheck").addClass("fullChecked") ;
				   }
				   else {
					   $(treeNode).children(".treeSelCheck").addClass("partChecked") ;
				   }
				}
				modelNode = modelNode._parent ;
			}
			/* update children checkboxes */
			modelNode = checkboxTree.tree.treeView("getNodes",nodeContent$)[0] ;
			updateCheckboxes(modelNode,checkboxTree.tree) ;
			
			return false; // stop propagation and prevent default
		}
	) ;
	
	return(checkboxTree) ;
}

function updateChecked(node,selection) {
    var result = {
		leaves: 0,
		checkedLeaves: 0
	} ;
    if(node.children) {
        node.children.forEach(function(inode,index,arrayOfChildren){
            var subStatus = updateChecked(inode,selection) ;
            result.leaves += subStatus.leaves;
			result.checkedLeaves += subStatus.checkedLeaves ;
        }) ;
    }
    else {
		/* this is a leaf */
		/* isChecked: 0 => unchecked, 1 => checked */
		if(typeof node.isChecked == "undefined"){
			/* first pass, node initialization for checkbox */
			node.isChecked = 0 ;
		}
		result.leaves = 1 ;
		result.checkedLeaves = node.isChecked ;
		if(node.isChecked == 1 ) {
			selection.push(node.id) ;
		}
    }
	node.checkedStatus = result ;
    return(result) ;
}

function clearSubTree(node){
	if(node.children){
		node.children.forEach(function(inode,index,arrayOfChildren){
			clearSubTree(inode);
		}) ;
	}
	else {
		node.isChecked = 0 ;
	}
	
}

function addSubTree(node){
	if(node.children){
		node.children.forEach(function(inode,index,arrayOfChildren){
			addSubTree(inode);
		}) ;
	}
	else {
		node.isChecked = 1 ;
	}
	
}

function updateCheckboxes(node,tree){
	if(node.children){
		node.children.forEach(function(inode,index,arrayOfChildren){
			updateCheckboxes(inode,tree);
		});
	}
	var treeNode = tree.treeView("getTreeNode",node) ;
	if(treeNode){
		$(treeNode).children(".treeSelCheck").removeClass("fullChecked").removeClass("partChecked");
		if(node.checkedStatus.checkedLeaves > 0 ){
		   if(node.checkedStatus.leaves == node.checkedStatus.checkedLeaves ) {
			   $(treeNode).children(".treeSelCheck").addClass("fullChecked") ;
		   }
		   else {
			   $(treeNode).children(".treeSelCheck").addClass("partChecked") ;
		   }
		}
	}
}

function checkboxSet(checkboxTree){
	if($v(checkboxTree.pageItem) != ''){
		var reloaded = $v(checkboxTree.pageItem).split(':') ;

		var dummyArray = [] ;
		
		resetSelection(checkboxTree.tree,checkboxTree.topLevel,reloaded) ;
		updateChecked(checkboxTree.topLevel,dummyArray) ;
		updateCheckboxes(checkboxTree.topLevel,checkboxTree.tree) ;
	}
}

function resetSelection(tree,node,reloaded){
    if(node.children){
        node.children.forEach(function(inode,index,arrayOfChildren){
            resetSelection(tree,inode,reloaded) ;
        }) ;
    }
    else {
        if(reloaded.indexOf(node.id) > -1 ){
            node.isChecked = 1 ;
        }
        else {
            node.isChecked = 0 ;
        }
    }
}

