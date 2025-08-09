import { useMemo } from "react";


export const useUniqueAuthors = (stories: Array<any>) => {

  const uniqueAuthorsSet = useMemo(() => {

    if ( stories === undefined || stories === null || stories.length === 0 ) return [];

    // get set of unique users from stories

    // there are two properties on stories of interest - author and userId
    // author was there originally, but when the idea of having anonymous stories was introduced, userId was added to the collection.
    // if a story is anonymous, author will be null.  But there are entries in the database with null authors and null userIds.

    // So, get list of story authors from list of stories.  Use author if it is there, userId if it isn't.
    // Then get the unique list and get the length of it.  That's the number of unique users writing stories.

    let authors = [];
    for ( let i = 0; i<stories.length; i++ ) {
      if ( stories[i].author !== null && stories[i].author !== undefined ) {
        authors.push( stories[i].author._id )
      } else {
        if ( stories[i].userId !== null && stories[i].userId !== undefined ) {
          authors.push( stories[i].userId )
        }
      }
    }
                                    
    let uniqueAuthors = Array.from(new Set(authors));

    return (uniqueAuthors);

  },[stories]);

  return uniqueAuthorsSet;
}

 