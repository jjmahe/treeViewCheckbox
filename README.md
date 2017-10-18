# treeViewCheckbox
Description : this project adds the checbox functionality upon the treeView built in plugin of Apex 5.

Usage:
* add the js file to the static files of your app and add its URL to the page in the URL for JS files
* in the global variables, add a var to hold the principal tree parameters
  var myCheckBoxTree ;
* add a page item to store the selection, hidden or text field i.e. P100_SELECTION
* create a treeView region and in its attributes, give it a statis id i.e. mytree
* create a DA when page loads that will configure your treeView as a checbox tree. 
  a 'execute javascript' like this :
    myCheckBoxTree = checkboxPureInit('mytree','P100_SELECTION') ;
    
If you reload the selection from a previous session, then you can setup the tree like this :
  checkboxSet(myCheckBoxTree) ;
  
