import { useMemo } from "react";
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { StoryType } from "../../utils/types";
import { IDashboardFilterState } from "../dashboard/interface";
import { SummaryStoriesType } from "./index";

dayjs.extend(weekOfYear);



// Create a short label string for the first week of every month, in the form of short month name and 2 digit year
const monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const createDateLabelString = ( date: Date, sparseLabels : boolean ) => {
  let day = date.getDate();
  let returnLabel = " ";

  if ( day < 8 ) {
    let month = date.getMonth();
    let year = date.getFullYear();
  
    if ( month === 0 ) {
      returnLabel = year.toString();
    } else {
      if ( sparseLabels ) {
        if ( month % 3 === 0 ) { 
          returnLabel = monthNames[month];
        }
      } else {
        returnLabel = monthNames[month];
      }

    }
  }
  return returnLabel;
};

const createTooltipDateString = ( date: Date ) => {
  return date.toLocaleDateString();
}

const isValidDate =  ( month: string, year: string ): boolean => {
  return dayjs( month + " " + year, ['MMMM YYYY', 'MMM YYYY', 'MM YY'] ).isValid();
}


export const useStoriesSummary = (stories: Array<StoryType>, filter: IDashboardFilterState) => {

  const perWeekStorySummary = useMemo(() => {
    if ( stories === undefined || stories === null || stories.length === 0 ) {
      return [];
    }

    // filter to stories with defined createdAt, then convert createdAt to Date type, then sort into chronological order 
    let sortedStories = stories.filter( p=>p?.createdAt !== undefined )
                            .map( (val) => { 
                                  var valDate = val.createdAt as any; 
                                  return { createdAt:  new Date( valDate ), category: val.type }
                                })
                            .sort( (a,b) => a.createdAt.getTime() - b.createdAt.getTime() );

  
    var perWeekStories : Array<SummaryStoriesType> = [];
    
     // create entries for Sundays inclusive of the range of dates in sorted stories
    let lastStoryDate = sortedStories[sortedStories.length - 1].createdAt;
    let sunday = dayjs(sortedStories[0].createdAt).startOf('week').toDate();
    
    // if we have a valid filter, and a valid timePeriod in it, get the timePeriod from and to dates and recalculate end points
    if ( filter !== undefined ) {
      if ( isValidDate(filter.insightsTimePeriod.fromMonth, filter.insightsTimePeriod.fromYear) 
        && isValidDate(filter.insightsTimePeriod.toMonth, filter.insightsTimePeriod.toYear) ) {

        lastStoryDate = dayjs( filter.insightsTimePeriod.toMonth + " " + filter.insightsTimePeriod.toYear).toDate();
        lastStoryDate = dayjs(lastStoryDate).add( 1, 'month').toDate();
        sunday = dayjs( filter.insightsTimePeriod.fromMonth + " " + filter.insightsTimePeriod.fromYear ).startOf('week').toDate();
      }
    } 

    // estimate how many labels to provide for the X Axis based on the number of weeks being shown.
    const kMillsecondsToSwitchToSparseLabels : number = 40 * 7 * 24 * 3600 * 1000; // based on 40 weeks
    let createSparseLabels : boolean = ( ( lastStoryDate.getTime() - sunday.getTime() ) >= kMillsecondsToSwitchToSparseLabels );
  
    while ( sunday <= lastStoryDate ) {
      perWeekStories.push( { startDate: sunday,
        label: createDateLabelString( sunday, createSparseLabels ),
        tooltipLabel: createTooltipDateString( sunday ),
        numStories: 0,
        numSuccesses: 0,
        numLessonsLearned: 0
      });
      sunday = dayjs(sunday).add(1, 'week').toDate();
    }
  
    // push the last sunday onto the array
    perWeekStories.push( { startDate: sunday,
      label: createDateLabelString( sunday, createSparseLabels ),
      tooltipLabel: createTooltipDateString( sunday ),
      numStories: 0,
      numSuccesses: 0,
      numLessonsLearned: 0
    });
 
    for ( let i = 0; i < (perWeekStories.length - 1); i++ ) {
      let startDate = perWeekStories[i].startDate;
      let endDate = perWeekStories[i+1].startDate;

      let weeklyStories = sortedStories.filter( (story) =>  ( (story.createdAt.getTime() >= startDate.getTime()) && (story.createdAt.getTime() < endDate.getTime()) ) );
      perWeekStories[i].numStories = weeklyStories.length;

      perWeekStories[i].numSuccesses = weeklyStories.reduce(( accumulator, currentValue ) => {
        if ( currentValue.category === "SW" ) accumulator += 1;
        return accumulator;
      }, 0 ); 

      perWeekStories[i].numLessonsLearned = weeklyStories.reduce(( accumulator, currentValue ) => {
        if ( currentValue.category === "LL" ) accumulator += 1;
        return accumulator;
      }, 0 ); 
    }

 
    return perWeekStories;

  },[stories, filter]);

  return perWeekStorySummary;
};
