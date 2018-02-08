hexo.extend.helper.register( "tocToArray", function ( tocString ) {
	const
		rol = /(\/\s*)?ol\s*|class=".+?-text">\s*(.*?)\s*</gi,
		list = [],
		parents = [];
	let currentHierarchy = lastChild = null;

	tocString.replace ( rol, ( match, rep1, rep2 ) => {
		if ( match.trim ().substr ( -2 ) === "ol" ) {
			if ( rep1 === undefined ) {
				parents.push ( currentHierarchy );
				currentHierarchy = lastChild ? lastChild.children : list;
			}
			else if ( rep1.substr ( 0, 1 ) === "/" ) {
				currentHierarchy = parents.pop ();

			}
		}
		else if ( rep2 !== null || rep2 !== undefined ) {
			lastChild = {
				tag: rep2,
				children: []
			};
			currentHierarchy.push ( lastChild );
		}
	} );

	return JSON.stringify ( list );
});