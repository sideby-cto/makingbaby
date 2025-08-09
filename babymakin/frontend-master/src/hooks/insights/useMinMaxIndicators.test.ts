import { renderHook } from "@testing-library/react";
import { useMinMaxIndicators } from "./useMinMaxIndicators";


// define dashboardData, stories list for each case from Kippy's Table ( https://docs.google.com/presentation/d/13L4DrRtC45RSEWKHm3eTDGjpzrL4nFRd7pfZc90Iuc4/edit?usp=sharing )


// Set 1  6 Indicators- A = 3, B = 3, C = 2, D = 2, E = 1, F = 1
// Should result in Max: A, B, tied with 2, Min: E, F
const kSet1PromisingPractices = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 3},
    { "id": "C", "name": "C", "value": 2},
    { "id": "D", "name": "D", "value": 2},
    { "id": "E", "name": "E", "value": 1},
    { "id": "F", "name": "F", "value": 1},
 ];

 const kSet1SuccessSigns = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 3},
    { "id": "C", "name": "C", "value": 2},
    { "id": "D", "name": "D", "value": 2},
    { "id": "E", "name": "E", "value": 1},
    { "id": "F", "name": "F", "value": 1},
 ];

const kSet1StudentCharacteristics =  [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 3},
    { "id": "C", "name": "C", "value": 2},
    { "id": "D", "name": "D", "value": 2},
    { "id": "E", "name": "E", "value": 1},
    { "id": "F", "name": "F", "value": 1},
 ];

const kSet1Stories = [
    {
        "_id": "1",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}]
    },
    {
        "_id": "2",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}]
    },
    {
        "_id": "3",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}]
    },
    {
        "_id": "4",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}]
    },
    {
        "_id": "5",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "C", "name": "C"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}],
        "promisingPractices": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}]
    },
    {
        "_id": "6",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },

];
const kSet1DashboardData = {
    "stories": kSet1Stories,
    "promisingPractices": kSet1PromisingPractices,
    "successSigns": kSet1SuccessSigns,
    "studentCharacteristics": kSet1StudentCharacteristics
};

const kSet1PPSuccess =  {
    type: 'PP',
    combined: {
        storyType: 'Combined',
        xAxisLength: 10,
        minSet: [ {"id": "E", "fill": "#304A78", "name": "E", "value": 1}, { "id": "F", "fill": "#304A78", "name": "F", "value": 1 }],
        maxSet: [ {"id": "A", "fill": "#678293", "name": "A", "value": 3}, { "id": "B", "fill": "#678293", "name": "B", "value": 3}, {"id": "C","fill": "#678293", "name": "2 additional, see Dashboard for details", "value": 2}]
    },
    smallWins: {
        storyType: 'SW',
        xAxisLength: 10,
        minSet: [ {"id": "E", "fill": "#57BDA2", "name": "E", "value": 1}, { "id": "F", "fill": "#57BDA2", "name": "F", "value": 1 }],
        maxSet: [ {"id": "A", "fill": "#2493A2", "name": "A", "value": 3}, { "id": "B", "fill": "#2493A2", "name": "B", "value": 3}, {"id": "C","fill": "#2493A2", "name": "2 additional, see Dashboard for details", "value": 2}]
     },
    lessonsLearned: {
        storyType: 'LL',
        xAxisLength: 0,
        minSet: [],
        maxSet: []
    }
};


// Set 2  A = 3, B = 2, C = 1, D = 1, E = 1, F = 1
// Should result in Max: A, B, tied with 4, Min: No Data
const kSet2PromisingPractices = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 2},
    { "id": "C", "name": "C", "value": 1},
    { "id": "D", "name": "D", "value": 1},
    { "id": "E", "name": "E", "value": 1},
    { "id": "F", "name": "F", "value": 1},
 ];

 const kSet2SuccessSigns = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 2},
    { "id": "C", "name": "C", "value": 1},
    { "id": "D", "name": "D", "value": 1},
    { "id": "E", "name": "E", "value": 1},
    { "id": "F", "name": "F", "value": 1},
 ];

const kSet2StudentCharacteristics =  [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 2},
    { "id": "C", "name": "C", "value": 1},
    { "id": "D", "name": "D", "value": 1},
    { "id": "E", "name": "E", "value": 1},
    { "id": "F", "name": "F", "value": 1},
 ];

const kSet2Stories = [
    {
        "_id": "1",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}]
    },
    {
        "_id": "2",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}]
    },
    {
        "_id": "3",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}]
    },
    {
        "_id": "4",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}]
    },
    {
        "_id": "5",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "C", "name": "C"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}],
        "promisingPractices": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}]
    },
    {
        "_id": "6",
        "type": "SW",
        "successSigns": [{ "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "E", "name": "E"}]
    },

];
const kSet2DashboardData = {
    "stories": kSet2Stories,
    "promisingPractices": kSet2PromisingPractices,
    "successSigns": kSet2SuccessSigns,
    "studentCharacteristics": kSet2StudentCharacteristics
};

const kSet2PPSuccess =  {

    "combined": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#678293", "name": "A", "value": 3}, 
                {"id": "B", "fill": "#678293", "name": "B", "value": 2 }, 
                {"id": "C", "fill": "#678293", "name": "4 additional, see Dashboard for details", "value": 1}
            ], 
         "minSet": 
            [
            ], 
         "storyType": "Combined", 
         "xAxisLength": 10
        }, 
    "lessonsLearned": 
        {"maxSet": 
            [
            ], 
         "minSet": 
            [ ], 
         "storyType": "LL", 
         "xAxisLength": 0
        }, 
    "smallWins": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#2493A2", "name": "A", "value": 3}, 
                {"id": "B", "fill": "#2493A2", "name": "B", "value": 2 }, 
                {"id": "C", "fill": "#2493A2", "name": "4 additional, see Dashboard for details", "value": 1}
            ], 
         "minSet": 
            [
            ], 
         "storyType": "SW", 
         "xAxisLength": 10
        }, 
    "type": "PP"
};


// Set 3  6 Indicators A = 3, B = 3, C = 3, D = 3, E = 3, F = 3
// Should result in Max: A, B, tied with C-J, Min: No Data
const kSet3PromisingPractices = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 3},
    { "id": "C", "name": "C", "value": 3},
    { "id": "D", "name": "D", "value": 3},
    { "id": "E", "name": "E", "value": 3},
    { "id": "F", "name": "F", "value": 3},
 ];

 const kSet3SuccessSigns = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 3},
    { "id": "C", "name": "C", "value": 3},
    { "id": "D", "name": "D", "value": 3},
    { "id": "E", "name": "E", "value": 3},
    { "id": "F", "name": "F", "value": 3},
 ];

const kSet3StudentCharacteristics =  [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 3},
    { "id": "C", "name": "C", "value": 3},
    { "id": "D", "name": "D", "value": 3},
    { "id": "E", "name": "E", "value": 3},
    { "id": "F", "name": "F", "value": 3},
 ];

const kSet3Stories = [
    {
        "_id": "1",
        "type": "SW",
        "successSigns": [{ "_id": "C", "name": "C"}, { "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "C", "name": "C"}, { "_id": "A", "name": "A"}],
        "promisingPractices": [,{ "_id": "C", "name": "C"}, { "_id": "A", "name": "A"}]
    },
    {
        "_id": "2",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}]
    },
    {
        "_id": "3",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "F", "name": "F"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "F", "name": "F"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "F", "name": "F"}]
    },
    {
        "_id": "4",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}, { "_id": "B", "name": "B"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}, { "_id": "B", "name": "B"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}, { "_id": "B", "name": "B"}]
    },
    {
        "_id": "5",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "C", "name": "C"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}, { "_id": "E", "name": "E"}]
    },
    {
        "_id": "6",
        "type": "SW",
        "successSigns": [{ "_id": "D", "name": "D"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "D", "name": "D"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "D", "name": "D"}, { "_id": "E", "name": "E"}]
    },
    {
        "_id": "7",
        "type": "SW",
        "successSigns": [{ "_id": "F", "name": "F"}],
        "studentCharacteristics": [{ "_id": "F", "name": "F"}],
        "promisingPractices": [{ "_id": "F", "name": "F"}]
    },
    {
        "_id": "8",
        "type": "SW",
        "successSigns": [{ "_id": "D", "name": "D"}, { "_id": "C", "name": "C"}],
        "studentCharacteristics": [{ "_id": "D", "name": "D"}, { "_id": "C", "name": "C"}],
        "promisingPractices": [{ "_id": "D", "name": "D"}, { "_id": "C", "name": "C"}]
    },
    {
        "_id": "9",
        "type": "SW",
        "successSigns": [{ "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "E", "name": "E"}]
    },

];

const kSet3DashboardData = {
    "stories": kSet3Stories,
    "promisingPractices": kSet3PromisingPractices,
    "successSigns": kSet3SuccessSigns,
    "studentCharacteristics": kSet3StudentCharacteristics
};

const kSet3PPSuccess =  {

    "combined": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#678293", "name": "A", "value": 3}, 
                {"id": "B", "fill": "#678293", "name": "B", "value": 3}, 
                {"id": "C", "fill": "#678293", "name": "4 additional, see Dashboard for details", "value": 3}
            ], 
         "minSet": 
            [
            ], 
         "storyType": "Combined", 
         "xAxisLength": 10
        }, 
    "lessonsLearned": 
        {"maxSet": 
            [
            ], 
         "minSet": 
            [  ], 
         "storyType": "LL", 
         "xAxisLength": 0
        }, 
    "smallWins": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#2493A2", "name": "A", "value": 3}, 
                {"id": "B", "fill": "#2493A2", "name": "B", "value": 3}, 
                {"id": "C", "fill": "#2493A2", "name": "4 additional, see Dashboard for details", "value": 3}
            ], 
         "minSet": 
            [
            ], 
         "storyType": "SW", 
         "xAxisLength": 10
        }, 
    "type": "PP"
};
    
// Set 4 A = 3, B = 2
// Should result in Max: A, B Min: No Data

const kSet4PromisingPractices = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 2}
 ];

 const kSet4SuccessSigns = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 2}
 ];

const kSet4StudentCharacteristics =  [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 2}
 ];

const kSet4Stories = [
    {
        "_id": "1",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}]
    },
    {
        "_id": "2",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}]
    },
    {
        "_id": "3",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}]
    },
    {
        "_id": "4",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}]
    },
    {
        "_id": "5",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}]
    },
 ];

const kSet4DashboardData = {
    "stories": kSet4Stories,
    "promisingPractices": kSet4PromisingPractices,
    "successSigns": kSet4SuccessSigns,
    "studentCharacteristics": kSet4StudentCharacteristics
};

const kSet4PPSuccess =  {
    "combined": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#678293", "name": "A", "value": 3}, 
                {"id": "B", "fill": "#678293", "name": "B", "value": 2}
            ], 
         "minSet": 
            [
            ], 
         "storyType": "Combined", 
         "xAxisLength": 10
        }, 
    "lessonsLearned": 
        {"maxSet": 
            [
            ], 
         "minSet": 
            [

            ], 
         "storyType": "LL", 
         "xAxisLength": 0
        }, 
    "smallWins": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#2493A2", "name": "A", "value": 3}, 
                {"id": "B", "fill": "#2493A2", "name": "B", "value": 2}
            ], 
         "minSet": 
            [
            ], 
         "storyType": "SW", 
         "xAxisLength": 10
        }, 
    "type": "PP"
};

// Set 5 A = 3, B = 0, C = 0
// Should result in Max: A, Min: B, C with zero values

const kSet5PromisingPractices = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 0},
    { "id": "C", "name": "C", "value": 0}
];

 const kSet5SuccessSigns = [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 0},
    { "id": "C", "name": "C", "value": 0}
];

const kSet5StudentCharacteristics =  [
    { "id": "A", "name": "A", "value": 3},
    { "id": "B", "name": "B", "value": 0},
    { "id": "C", "name": "C", "value": 0}
];

const kSet5Stories = [
    {
        "_id": "1",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}]
    },
    {
        "_id": "2",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}]
    },
      {
        "_id": "4",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}]
    },
];

const kSet5DashboardData = {
    "stories": kSet5Stories,
    "promisingPractices": kSet5PromisingPractices,
    "successSigns": kSet5SuccessSigns,
    "studentCharacteristics": kSet5StudentCharacteristics
};

const kSet5PPSuccess =  {
    "combined": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#678293", "name": "A", "value": 3}, 
            ], 
         "minSet": 
            [
            ], 
         "storyType": "Combined", 
         "xAxisLength": 10
        }, 
    "lessonsLearned": 
        {"maxSet": 
            [
             ], 
         "minSet": 
            [
            ], 
         "storyType": "LL", 
         "xAxisLength": 0
        }, 
    "smallWins": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#2493A2", "name": "A", "value": 3}, 
            ], 
         "minSet": 
            [
            ], 
         "storyType": "SW", 
         "xAxisLength": 10
        }, 
    "type": "PP"
};

// Set 6 A = 1
// Should result in Max: A,  Min: No Data

const kSet6PromisingPractices = [
    { "id": "A", "name": "A", "value": 3}
 ];

 const kSet6SuccessSigns = [
    { "id": "A", "name": "A", "value": 3}
 ];

const kSet6StudentCharacteristics =  [
    { "id": "A", "name": "A", "value": 3}
 ];

const kSet6Stories = [
    {
        "_id": "1",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}]
    }
 ];

const kSet6DashboardData = {
    "stories": kSet6Stories,
    "promisingPractices": kSet6PromisingPractices,
    "successSigns": kSet6SuccessSigns,
    "studentCharacteristics": kSet6StudentCharacteristics
};

const kSet6PPSuccess =  {
    "combined": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#678293", "name": "A", "value": 1}, 
            ], 
         "minSet": 
            [
            ], 
         "storyType": "Combined", 
         "xAxisLength": 10
        }, 
    "lessonsLearned": 
        {"maxSet": 
            [
            ], 
         "minSet": 
            [
            ], 
         "storyType": "LL", 
         "xAxisLength": 0
        }, 
    "smallWins": 
        {"maxSet": 
            [
                {"id": "A", "fill": "#2493A2", "name": "A", "value": 1}, 
            ], 
         "minSet": 
            [
            ], 
         "storyType": "SW", 
         "xAxisLength": 10
        }, 
    "type": "PP"
};

global.fetch = jest.fn();

describe("useMinMaxIndicators Set1", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return values for Set 1", async () => {
    const { result } = renderHook(() => useMinMaxIndicators(kSet1DashboardData, kSet1Stories));
    const { ppIndicatorSet } = result.current;

    // this being not wrapped in a waitFor causes the act errors in the console.
    expect( ppIndicatorSet.type).toBe( kSet1PPSuccess.type);
    expect( ppIndicatorSet.combined).toStrictEqual( kSet1PPSuccess.combined);
    expect( ppIndicatorSet.smallWins).toStrictEqual( kSet1PPSuccess.smallWins);
    expect( ppIndicatorSet.lessonsLearned).toStrictEqual( kSet1PPSuccess.lessonsLearned);
   
    expect(ppIndicatorSet).toStrictEqual(kSet1PPSuccess);

  });
});

describe("useMinMaxIndicators Set2", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("return values for Set 2", async () => {
        const { result } = renderHook(() => useMinMaxIndicators(kSet2DashboardData, kSet2Stories));
        const { ppIndicatorSet } = result.current;

        // this being not wrapped in a waitFor causes the act errors in the console.
        expect( ppIndicatorSet.type).toBe( kSet2PPSuccess.type);
        expect( ppIndicatorSet.combined).toStrictEqual( kSet2PPSuccess.combined);
        expect( ppIndicatorSet.smallWins).toStrictEqual( kSet2PPSuccess.smallWins);
        expect( ppIndicatorSet.lessonsLearned).toStrictEqual( kSet2PPSuccess.lessonsLearned);
   
        expect(ppIndicatorSet).toStrictEqual(kSet2PPSuccess);
    });
});

describe("useMinMaxIndicators Set3", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("return values for Set 3", async () => {
        const { result } = renderHook(() => useMinMaxIndicators(kSet3DashboardData, kSet3Stories));
        const { ppIndicatorSet } = result.current;

        // this being not wrapped in a waitFor causes the act errors in the console.
        expect( ppIndicatorSet.type).toBe( kSet3PPSuccess.type);
        expect( ppIndicatorSet.combined).toStrictEqual( kSet3PPSuccess.combined);
        expect( ppIndicatorSet.smallWins).toStrictEqual( kSet3PPSuccess.smallWins);
        expect( ppIndicatorSet.lessonsLearned).toStrictEqual( kSet3PPSuccess.lessonsLearned);

        expect(ppIndicatorSet).toStrictEqual(kSet3PPSuccess);
    });
});

describe("useMinMaxIndicators Set4", () => {
    beforeEach(() => {
    jest.clearAllMocks();
    });

    it("return values for Set 4", async () => {
        const { result } = renderHook(() => useMinMaxIndicators(kSet4DashboardData, kSet4Stories));
        const { ppIndicatorSet } = result.current;

        // this being not wrapped in a waitFor causes the act errors in the console.
        expect( ppIndicatorSet.type).toBe( kSet4PPSuccess.type);
        expect( ppIndicatorSet.combined).toStrictEqual( kSet4PPSuccess.combined);
        expect( ppIndicatorSet.smallWins).toStrictEqual( kSet4PPSuccess.smallWins);
        expect( ppIndicatorSet.lessonsLearned).toStrictEqual( kSet4PPSuccess.lessonsLearned);

        expect(ppIndicatorSet).toStrictEqual(kSet4PPSuccess);

    });
});

describe("useMinMaxIndicators Set5", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("return values for Set 5", async () => {
        const { result } = renderHook(() => useMinMaxIndicators(kSet5DashboardData, kSet5Stories));
        const { ppIndicatorSet } = result.current;
  
        // this being not wrapped in a waitFor causes the act errors in the console.
        expect( ppIndicatorSet.type).toBe( kSet5PPSuccess.type);
        expect( ppIndicatorSet.combined).toStrictEqual( kSet5PPSuccess.combined);
        expect( ppIndicatorSet.smallWins).toStrictEqual( kSet5PPSuccess.smallWins);
        expect( ppIndicatorSet.lessonsLearned).toStrictEqual( kSet5PPSuccess.lessonsLearned);

        expect(ppIndicatorSet).toStrictEqual(kSet5PPSuccess);
  
    });
});

describe("useMinMaxIndicators Set6", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("return values for Set 6", async () => {
        const { result } = renderHook(() => useMinMaxIndicators(kSet6DashboardData, kSet6Stories));
        const { ppIndicatorSet } = result.current;
  
        // this being not wrapped in a waitFor causes the act errors in the console.
        expect( ppIndicatorSet.type).toBe( kSet6PPSuccess.type);
        expect( ppIndicatorSet.combined).toStrictEqual( kSet6PPSuccess.combined);
        expect( ppIndicatorSet.smallWins).toStrictEqual( kSet6PPSuccess.smallWins);
        expect( ppIndicatorSet.lessonsLearned).toStrictEqual( kSet6PPSuccess.lessonsLearned);

        expect(ppIndicatorSet).toStrictEqual(kSet6PPSuccess);
  
    });
});


  