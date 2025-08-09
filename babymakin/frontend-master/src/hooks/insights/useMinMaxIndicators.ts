import { useMemo } from "react";

import { IndicatorType } from "./interface";
import { AugmentedStoryType } from "./interface";
import { IndicatorSet } from "./interface";
import { MinMaxIndicators } from "./interface";

import { COLOR } from "src/design-system";
import { StoryType } from "src/core";


const kNumIndicatorsToReturn = 3;

const kMaxSWColor = COLOR.teal;
const kMinSWColor = COLOR.aqua;

const kMaxLLColor = COLOR.yellowGold;
const kMinLLColor = COLOR.sand;

const kMaxCombinedColor = COLOR.glaucous;
const kMinCombinedColor = COLOR.mediumBlue;

const tieString = " additional, see Dashboard for details"


const getCountOfValue = ( inputArray: Array<any>, value : number ) => {

  return inputArray.filter( (e) => e.value === value ).length;
};

function indicatorCompareFunction( elementA : any, elementB :any )  {

  // are these two elements tied? if not, preserve order
  if ( elementA.value !== elementB.value ) {
    return 0;
  }

  // push any element with the tieString to the end of the list
  if ( elementA.name.includes( tieString ) ) {
    return 1;
  }

  if ( elementB.name.includes( tieString ) ) {
    return -1;
  }

  // otherwise return the elements alphabetically
  return elementA.name.localeCompare( elementB.name );

};


const getMinMaxSet = (  storyType : AugmentedStoryType,
                        indicatorArray : Array<any> ) => {

  let maxData : Array<any>= [];
  let minData : Array<any> = [];

  let xAxisLimit: number = 0;

  if ( indicatorArray === undefined || indicatorArray === null || indicatorArray.length === 0 ) {
    return {maxData, minData, xAxisLimit };
  }

  // this function makes some destructive changes to the indicatorArray, 
  // and sometimes returns two references to the same indicator, depending on the data
  // as a result, the code makes some hard copies of the array and individual elements.
  // this avoids disturbing any downstream operations on the indicatorArray,
  // and allows us to assign separate colors for min and max for the case where an indicator shows up on both.
  // since the code is memo-ized, and the objects are small, this should not create too much memory pressure, but 
  // is a point for optimization.  Best solution- move the logic server side.


  let localIndicatorArray = JSON.parse( JSON.stringify(indicatorArray));
  
  // sort array by value, most to least
  localIndicatorArray.sort( (a : any,b : any) =>  b.value - a.value );

  // make the maxData array first

  // put the first ( kNumIndicatorsToReturn - 1 )indicators on the maxData array, stripping them out of localIndicatorArray in the process
  // but, no indicators with 0 values are allowed on the max array
  const nEntries = ( localIndicatorArray.length > kNumIndicatorsToReturn ) ? kNumIndicatorsToReturn : localIndicatorArray.length;

  for ( let i = 0; i < nEntries - 1; i++ ) {
    if ( localIndicatorArray.length > 0 ) {
      if ( localIndicatorArray.at(0).value !== 0 ) {
        maxData.push( localIndicatorArray.shift());
      }  
    }
  }

  // check to see if there are any indicators still on the array and figure out what the last maxData value should be if so
  if ( localIndicatorArray.length > 0 ) {

    // set up the last value for maxData
    if ( localIndicatorArray.at(0).value !== 0 ) {
      let count = getCountOfValue( localIndicatorArray, localIndicatorArray.at(0).value);

      if ( count === 1 ) {
        maxData.push( localIndicatorArray.shift());
      } else {
        let tiedIndicator = JSON.parse( JSON.stringify(localIndicatorArray.at(0)));
        tiedIndicator.name = count.toString() + tieString;
        maxData.push( tiedIndicator );

        // pull the tied values off of the array
        for ( let i = 0; i<count; i++ ) {
          localIndicatorArray.shift();
        }
      }
    }
  }

  // now do the minData array with what is left in the localIndicatorArray
  if ( localIndicatorArray.length > 0 ) {
    for ( let i = 0; i < nEntries - 1; i++ ) {
      if ( localIndicatorArray.length > 0 ) {
        if ( localIndicatorArray.at(localIndicatorArray.length - 1).value !== 0 ) {
          minData.push( localIndicatorArray.pop() );
        }
      }
    }

    // set up the last value for minData
    if ( localIndicatorArray.length > 0 ) {
      let count = getCountOfValue( localIndicatorArray, localIndicatorArray[localIndicatorArray.length-1].value);
      if ( count === 1 ) {
        if ( localIndicatorArray.at(localIndicatorArray.length - 1).value !== 0 ) {
          minData.push( localIndicatorArray.pop());
        }
      } else {
        if ( localIndicatorArray.at(localIndicatorArray.length - 1).value !== 0 ) {
          let tiedIndicator = JSON.parse( JSON.stringify(localIndicatorArray[localIndicatorArray.length-1]));
          tiedIndicator.name = count.toString() + tieString;
          minData.push( tiedIndicator );

          // pull the tied values off of the array
          for ( let i = 0; i<count; i++ ) {
            localIndicatorArray.pop();
          }
        }
      }        
    }
  }

  // if an indicator appears on both maxData and minData lists, remove it from minData  ( shouldn't happen anymore with updated code above, but keep the filter anyway )
  minData = minData.filter(ar => !maxData.find(rm => (rm.name === ar.name && ar.id === rm.id) ));
 
  // now, one last thing.  if there are tied values, sort them alphabetically, but not if they are the additional bucket- that should always be last
  maxData.sort(indicatorCompareFunction);
  minData.sort(indicatorCompareFunction);
 
  // set up the proper colors and xAxis Limit
  let minColor : string = kMinCombinedColor;
  let maxColor : string = kMaxCombinedColor;

  if ( storyType === "SW") {
    minColor  = kMinSWColor;
    maxColor  = kMaxSWColor;

  } else if ( storyType === "LL") {
    minColor  = kMinLLColor;
    maxColor  = kMaxLLColor;
  }

  minData.forEach((element) => {
    element.fill = minColor;
  });

  maxData.forEach((element) => {
    element.fill = maxColor;
  });

  if ( maxData.length > 0 ) {
    xAxisLimit = Math.ceil( maxData[0].value/ 10.0 ) * 10.0;
  } else {
    xAxisLimit =  0.0;
  }
 
  return { maxData, minData, xAxisLimit };
};



// the functionality in the following function should really be on the back end
// we don't have API calls for retrieving both SW and LL together, with tallies for indicators for each category
// it's expensive and somewhat memory intensive to do this on the frontend, especially as the # stories scales up
const getIndicatorCountsForStoryTypes = (
  dashboardData: any,
  stories: Array<StoryType>
) => {

  let ppSWCounts : Array<any> = [];
  let ppLLCounts : Array<any> = [];
  let ppCombinedCounts : Array<any> = [];

  let ssSWCounts : Array<any> = [];
  let ssLLCounts : Array<any> = [];
  let ssCombinedCounts : Array<any> = [];

  let scSWCounts : Array<any> = [];
  let scLLCounts : Array<any> = [];
  let scCombinedCounts : Array<any> = [];



   // return early if dashboardData is not valid
  if (!dashboardData || dashboardData === undefined ) {
    return { ppSWCounts, ppLLCounts, ppCombinedCounts, ssSWCounts, ssLLCounts, ssCombinedCounts, scSWCounts, scLLCounts, scCombinedCounts };
  }

  if ( !stories || stories === undefined ) {
    return { ppSWCounts, ppLLCounts, ppCombinedCounts, ssSWCounts, ssLLCounts, ssCombinedCounts, scSWCounts, scLLCounts, scCombinedCounts };
  }

  // get the lists from the dashboard data and filters for all indicator types
  const ppList = dashboardData.promisingPractices;

  const ssList = dashboardData.successSigns;

  const scList = dashboardData.studentCharacteristics;

  // extract the pp, ss, sc ids into arrays to use for count up the appearance of them in SW and LL stories

  type CountDictionary = {
    id: string,
    swCount: number,
    llCount: number,
    combinedCount: number,
  };


  let ppCounts : Array<CountDictionary> = [];
  ppList.forEach( (pp: any) => { ppCounts.push ( {
                                          id: pp.id,
                                          swCount: 0,
                                          llCount: 0,
                                          combinedCount: 0,
                                        } )
  });
  let ssCounts : Array<CountDictionary> = [];
  ssList.forEach( (ss: any) => { ssCounts.push ( {
                                          id: ss.id,
                                          swCount: 0,
                                          llCount: 0,
                                          combinedCount: 0,
                                        } )
  });

  let scCounts : Array<CountDictionary> = [];
  scList.forEach( (sc: any) => { scCounts.push ( {
                                          id: sc.id,
                                          swCount: 0,
                                          llCount: 0,
                                          combinedCount: 0,
                                        } )
  });


  // now run through the stories array ONCE and increment the count of indicators for SW and LL
  stories.forEach( (story: any) => {

    story.promisingPractices.forEach ( (pp: any) => {
        let ppCountsIndex = ppCounts.findIndex( ( ppCountItem ) => ppCountItem.id === pp._id  );

        if ( ppCountsIndex !== -1 ) {
          if ( story.type === 'SW' ) {
             ppCounts[ppCountsIndex].swCount += 1;
          } else {
            ppCounts[ppCountsIndex].llCount += 1;
          }
          ppCounts[ppCountsIndex].combinedCount += 1;
        }
        
      });


    story.successSigns.forEach ( (ss: any) => {
        let ssCountsIndex = ssCounts.findIndex( ( ssCountItem ) => ssCountItem.id === ss._id );
        if ( ssCountsIndex !== -1 ) {
          if ( story.type === 'SW' ) {
             ssCounts[ssCountsIndex].swCount += 1;
          } else {
            ssCounts[ssCountsIndex].llCount += 1;
          }
          ssCounts[ssCountsIndex].combinedCount += 1;
        }
        
      });
  
    story.studentCharacteristics.forEach ( (sc: any) => {
        let scCountsIndex = scCounts.findIndex( ( scCountItem ) => scCountItem.id === sc._id );
        if ( scCountsIndex !== -1 ) {
          if ( story.type === 'SW' ) {
             scCounts[scCountsIndex].swCount += 1;
          } else {
            scCounts[scCountsIndex].llCount += 1;
          }
          scCounts[scCountsIndex].combinedCount += 1;
        }
        
      });

  });

   // make three ( one for SW, one for LL and one for Combined) deep, independent copies and set the value for each indicator in the copies
  ppSWCounts = JSON.parse(JSON.stringify(ppList));
  ppLLCounts = JSON.parse(JSON.stringify(ppList));
  ppCombinedCounts = JSON.parse(JSON.stringify(ppList));

  ppSWCounts.forEach((item:any) => { 
    let ppCountsIndex = ppCounts.findIndex( ( ppCountItem ) => ppCountItem.id === item.id  );
    if (ppCountsIndex !== -1 ) {
      item.value = ppCounts[ppCountsIndex].swCount;
    } else {
      item.value = 0;
    }
  });

  ppLLCounts.forEach((item:any) => { 
    let ppCountsIndex = ppCounts.findIndex( ( ppCountItem ) => ppCountItem.id === item.id );
    if (ppCountsIndex !== -1 ) {
      item.value = ppCounts[ppCountsIndex].llCount;
    } else {
      item.value = 0;
    }
  });

  ppCombinedCounts.forEach((item:any) => { 
    let ppCountsIndex = ppCounts.findIndex( ( ppCountItem ) => ppCountItem.id === item.id );
    if (ppCountsIndex !== -1 ) {
      item.value = ppCounts[ppCountsIndex].combinedCount;
    } else {
      item.value = 0;
    }
  });

  ssSWCounts = JSON.parse(JSON.stringify(ssList));
  ssLLCounts = JSON.parse(JSON.stringify(ssList));
  ssCombinedCounts = JSON.parse(JSON.stringify(ssList));

  ssSWCounts.forEach((item:any) => { 
    let ssCountsIndex = ssCounts.findIndex( ( ssCountItem ) =>  ssCountItem.id === item.id );
    if (ssCountsIndex !== -1 ) {
      item.value = ssCounts[ssCountsIndex].swCount;
    } else {
      item.value = 0;
    }
  });
  
  ssLLCounts.forEach((item:any) => { 
    let ssCountsIndex = ssCounts.findIndex( ( ssCountItem ) => ssCountItem.id === item.id  );
    if (ssCountsIndex !== -1 ) {
      item.value = ssCounts[ssCountsIndex].llCount;
    } else {
      item.value = 0;
    }
 });

  ssCombinedCounts.forEach((item:any) => { 
    let ssCountsIndex = ssCounts.findIndex( ( ssCountItem ) => ssCountItem.id === item.id  );
    if (ssCountsIndex !== -1 ) {
      item.value = ssCounts[ssCountsIndex].combinedCount;
    } else {
      item.value = 0;
    }
  });

  scSWCounts = JSON.parse(JSON.stringify(scList));
  scLLCounts = JSON.parse(JSON.stringify(scList));
  scCombinedCounts = JSON.parse(JSON.stringify(scList));

  scSWCounts.forEach((item:any) => { 
    let scCountsIndex = scCounts.findIndex( ( scCountItem ) =>  scCountItem.id === item.id  );
    if (scCountsIndex !== -1 ) {
      item.value = scCounts[scCountsIndex].swCount;
    } else {
      item.value = 0;
    }
  });

  scLLCounts.forEach((item:any) => { 
    let scCountsIndex = scCounts.findIndex( ( scCountItem ) =>  scCountItem.id === item.id  );
    if (scCountsIndex !== -1 ) {
      item.value = scCounts[scCountsIndex].llCount;
    } else {
      item.value = 0;
    }
 });

  scCombinedCounts.forEach((item:any) => { 
    let scCountsIndex = scCounts.findIndex( ( scCountItem ) =>  scCountItem.id === item.id  );
    if (scCountsIndex !== -1 ) {
      item.value = scCounts[scCountsIndex].combinedCount;
    } else {
      item.value = 0;
    }
  });

 return { ppSWCounts, ppLLCounts, ppCombinedCounts, ssSWCounts, ssLLCounts, ssCombinedCounts, scSWCounts, scLLCounts, scCombinedCounts };
};

const getMinMaxSetForIndicator = (
  indicatorArray: Array<any>,
  storyType: AugmentedStoryType 
  )  : MinMaxIndicators => {

  let minMaxSet : MinMaxIndicators = {
    storyType: storyType,
    xAxisLength: 0,
    minSet: [],
    maxSet: []
  }; 

  const {  maxData, minData, xAxisLimit  } = getMinMaxSet( storyType, indicatorArray );

  minMaxSet.maxSet = maxData;
  minMaxSet.minSet = minData;
  minMaxSet.xAxisLength = xAxisLimit;

  return minMaxSet;
};

export const useMinMaxIndicators = (
  dashboardData: any,
  stories: Array<any>
)  => {

  const { ppIndicatorSet, ssIndicatorSet, scIndicatorSet  } = useMemo( () => {

    const {ppSWCounts, ppLLCounts, ppCombinedCounts, ssSWCounts, ssLLCounts, ssCombinedCounts, scSWCounts, scLLCounts, scCombinedCounts } = getIndicatorCountsForStoryTypes( dashboardData, stories );

    const combinedPPMinMaxSet = getMinMaxSetForIndicator(ppCombinedCounts, "Combined");
    const smallWinsPPMinMaxSet = getMinMaxSetForIndicator(ppSWCounts, "SW");
    const lessonsLearnedPPMinMaxSet = getMinMaxSetForIndicator(ppLLCounts, "LL");

    const combinedSSMinMaxSet = getMinMaxSetForIndicator(ssCombinedCounts, "Combined");
    const smallWinsSSMinMaxSet = getMinMaxSetForIndicator(ssSWCounts, "SW");
    const lessonsLearnedSSMinMaxSet = getMinMaxSetForIndicator(ssLLCounts, "LL");

    const combinedSCMinMaxSet = getMinMaxSetForIndicator(scCombinedCounts, "Combined");
    const smallWinsSCMinMaxSet = getMinMaxSetForIndicator(scSWCounts, "SW");
    const lessonsLearnedSCMinMaxSet = getMinMaxSetForIndicator(scLLCounts, "LL");

    const ppIndicatorSet : IndicatorSet = {
      type: "PP",
      combined: combinedPPMinMaxSet,
      smallWins: smallWinsPPMinMaxSet,
      lessonsLearned: lessonsLearnedPPMinMaxSet
    };

    const ssIndicatorSet : IndicatorSet = {
      type: "SS",
      combined: combinedSSMinMaxSet,
      smallWins: smallWinsSSMinMaxSet,
      lessonsLearned: lessonsLearnedSSMinMaxSet
    };

    const scIndicatorSet : IndicatorSet = {
      type: "SC",
      combined: combinedSCMinMaxSet,
      smallWins: smallWinsSCMinMaxSet,
      lessonsLearned: lessonsLearnedSCMinMaxSet
    };

    return { ppIndicatorSet, ssIndicatorSet, scIndicatorSet };
 
  }, [dashboardData, stories]);
  
  return { ppIndicatorSet, ssIndicatorSet, scIndicatorSet };
};