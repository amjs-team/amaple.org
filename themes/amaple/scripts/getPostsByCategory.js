hexo.extend.helper.register ( "getPostsByCategory", function ( posts, title, categoryName, transformLink, permalink ) {
	const postArray = [];
	posts.data.forEach ( post => {
		post.categories.data.forEach ( category => {
			if ( category.name === categoryName ) {
				const postItem = {
					title: post.title,
					path: transformLink ( post.path, permalink ),
					index: post.index
				};
				if ( post.title === title ) {
					postItem.current = true;
				}

				postArray.push ( postItem );
			}
		});
	} );
	
	return JSON.stringify ( postArray.sort ( ( a, b ) => {
			return a.index - b.index;
		})
	);
} );