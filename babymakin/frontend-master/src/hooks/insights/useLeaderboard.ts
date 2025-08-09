
import { useMemo } from "react";

import { StoryTellerLevel } from "./interface";
import { Contributor } from "./interface";

// Just some notes on ranking logic....
// 1.  We include stories that were written anonymously, but binned together into a single "Anonymous Contributor" category.
// 2.  We sort in descending order by numStories, and when numStories values are equal, we sort by name alphabetically.
// 3.  If there are ties for last place, we list them as Additional Contributors.
// 4.  Rankings can go from 1-5, but if two contributors are tied, they have the same rank.  

const nLeaderboardLevels : number = 5;
const maxLeaderboardParticipants : number = 5;
const kTieString = " Additional Contributors";
const kUndefinedName : string = "Anonymous Contributors";
const kUndefinedId : string = "00000000000000000000";

interface NameIdPair  {
    name: string,
    id: string,
};

interface levelRange {
    minValue: number,
    maxValue: number
};

const levelRanges : levelRange[] = [
    {   // Scribe
        minValue: 1,
        maxValue: 5
    },
    {   // Raconteur
        minValue: 6,
        maxValue: 10
    },
    {   // Balladeer
        minValue: 11,
        maxValue: 20
    },
    {   // Troubadour
        minValue: 21,
        maxValue: 30
    },
    {   // Bard
        minValue: 31,
        maxValue: 500
    },
];

const contributorLevel : StoryTellerLevel[] = [ 
                        StoryTellerLevel.scribe, 
                        StoryTellerLevel.raconteur, 
                        StoryTellerLevel.balladeer, 
                        StoryTellerLevel.troubadour, 
                        StoryTellerLevel.bard 
                    ];
  

const getLevelFromNumStories = ( numStories: number ) => {

    for ( let i = 0; i<nLeaderboardLevels; i++ ){
        if ( numStories >= levelRanges[i].minValue && numStories <= levelRanges[i].maxValue ) {
            return  i;
        }
    }
    return 0;
}

const createTooltipLabelFromLevel = ( level: number ) => {
    if ( level < 0 || level >= contributorLevel.length ) {
        return " ";
    }

    var levelName : String = contributorLevel[level];
    var levelRangeString: String = levelRanges[level].minValue.toString() + " to " + levelRanges[level].maxValue.toString() + " stories"

    return levelName + ": " + levelRangeString;
}

const getCountOfPeopleWithNumStories = ( inputArray: Array<any>, numStories : number ) => {

    return inputArray.filter( (e) => e.numStories === numStories ).length;
};


function contributorCompareFunction( elementA : any, elementB :any )  {

    // are these two elements tied? if not, preserve order
    if ( elementA.numStories !== elementB.numStories ) {
      return 0;
    }
  
    // push any element with the tieString to the end of the list
    if ( elementA.fullName.includes( kTieString ) ) {
      return 1;
    }
  
    if ( elementB.fullName.includes( kTieString ) ) {
      return -1;
    }
  
    // otherwise return the elements alphabetically
    return elementA.fullName.localeCompare( elementB.fullName );
};


function groupBy<T, K extends keyof any>(list: T[], key: (item: T) => K): Record<K, T[]> {
    return list.reduce((result, item) => {
      const groupKey = key(item);
  
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
  
      result[groupKey].push(item);
  
      return result;
    }, {} as Record<K, T[]>);
};


export const useLeaderboard = (stories: Array<any> ) => {
  
    const leaderboardAuthorsList = useMemo(() => {

        if ( stories === undefined || stories === null || stories.length === 0 ) return [];

        // collect an array of author id/name pairs for each story
        // handle anonymous stories by trying to look up the name using the userId
        let storyAuthorNames : Array<NameIdPair> = stories.map( (val) => {
            // sometimes stories will not have a userId value and sometimes they will not have an authorId value
            // try to return an array with one or the other
            if ( val.author?.name !== undefined ) {
                return { name: val.author.name as string, id: val.author._id as string };
            } else {
                return { name: kUndefinedName, id: kUndefinedId};
            } 
  
        });

        // group stories by author id, and get a separate array of unique author ids
        let storyAuthorCounts: any = groupBy( storyAuthorNames, (story) => story.id );
        
        let storyAuthorIds = storyAuthorNames.map( (val) => {  
                                                            return val?.id as string;
                                                    });                                
            
        let uniqueStoryAuthorIds = Array.from( new Set( storyAuthorIds ));

        // build up the storyAuthors array with name, id and numStories
        var storyAuthors = new Array<Contributor>();

        for ( let i = 0; i < uniqueStoryAuthorIds.length; i++ ) {

            if ( uniqueStoryAuthorIds[i] === undefined ) {
                continue;
            }
            const uniqueAuthorId = uniqueStoryAuthorIds[i];
            const authorStoryCount = storyAuthorCounts[uniqueAuthorId].length;
            const authorElement  = storyAuthorNames.find( (element) => element?.id === uniqueAuthorId);

            if ( authorElement === undefined || authorElement.name === undefined ) {
                continue;
            }
            storyAuthors.push( { ranking: 0, level:0, fullName: authorElement.name, numStories: authorStoryCount, tooltipLabel: " " });
        }    
        
        // sort by numStories and alphabetical by name when numStories are equal
        var sortedAuthors = storyAuthors.sort( (a,b) => b.numStories - a.numStories )
                                        .sort( contributorCompareFunction );


        // take the top authors from the sorted authors array, handling tied values, and adding information needed for display

        // start with the maxLeaderboardParticipants-1 set of entrants
        var leaderboardAuthors : Array<Contributor> = [];
        const nEntries = ( sortedAuthors.length > maxLeaderboardParticipants ) ? maxLeaderboardParticipants : sortedAuthors.length;
        let previousNumStories = 0;
        let ranking = 1;

        for ( let i = 0; i<( nEntries - 1 ); i++ ) {
            if ( previousNumStories > sortedAuthors[i].numStories ) {
                ranking += 1;
            }
            previousNumStories = sortedAuthors[i].numStories;

            let level = getLevelFromNumStories(sortedAuthors[i].numStories);
            leaderboardAuthors.push( {  "ranking": ranking, 
                                        "level": level,
                                        "fullName": sortedAuthors[i].fullName,
                                        "numStories": sortedAuthors[i].numStories,
                                        "tooltipLabel":createTooltipLabelFromLevel(level) } 
                                    );
        }
             

        // get a shortened version of the array with all the authors we already took above removed.
        sortedAuthors = sortedAuthors.slice(nEntries - 1 );

        // for the last entry, check for ties
        if ( sortedAuthors.length > 0 ) {
            const count = getCountOfPeopleWithNumStories(sortedAuthors, sortedAuthors[0].numStories );
            const level = getLevelFromNumStories(sortedAuthors[0].numStories);

        if ( previousNumStories > sortedAuthors[0].numStories ) {
            ranking += 1;
        }

        if ( count === 1 ) {
            leaderboardAuthors.push( {  "ranking": ranking, 
                                        "level": level,
                                        "fullName": sortedAuthors[0].fullName,
                                        "numStories": sortedAuthors[0].numStories,
                                        "tooltipLabel":createTooltipLabelFromLevel(level) } );
        } else {
            // there's a tie for that last place on the board
            let tieString = count.toString() + kTieString;
            leaderboardAuthors.push( {  "ranking": ranking, 
                                        "level": level,
                                        "fullName": tieString,
                                        "numStories": sortedAuthors[0].numStories,
                                        "tooltipLabel":createTooltipLabelFromLevel(level) } );
            }
        }

        return leaderboardAuthors;
    },[stories]);

    return leaderboardAuthorsList;
};
