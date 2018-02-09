hexo.extend.helper.register( "tranformLink", function ( link, permalink ) {
	link = link.split ( "/" );
	permalink = permalink.split ( "/" );

	for ( i in link ) {
		if ( link [ i ] !== permalink [ i ] ) {
			return link [ i ];
		}
	}
} );