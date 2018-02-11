hexo.extend.helper.register ( "getPostsByCategory", function ( posts, categoryName, transformLink, permalink ) {
	const postArray = [];
	posts.data.forEach ( post => {
		post.categories.data.forEach ( category => {
			if ( category.name === categoryName ) {
				postArray.push ( {
					title: post.title,
					path: transformLink ( post.path, permalink )
				} );
			}
		});
	} );
	
	return JSON.stringify ( postArray );
} );