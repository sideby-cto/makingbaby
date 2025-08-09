import { renderHook } from "@testing-library/react";
import { Contributor } from "./interface";
import { useLeaderboard } from "./useLeaderboard";

const kAllUsers = [
  {"id": "63347c6774df38f3c7a84b5e", "name": "Creative Arts Teacher "},
  {"id": '634ea3e4a2dfb20d344094aa', "name": 'Kathy Hamblen'},
  {"id": '6346eb7b320debb0687f4f51', "name": 'Erin Eppler '},
  {"id": '6346e9b4320debb0687f4e21', "name": 'Brian Jandreau '},
  {"id": '634d6f0464ae6e7cb8eb2ab8', "name": 'Heather Perry '},
  {"id": '634d6f0464ae6e7cb8eb2ab9', "name": "Mr. Smith"},
  {"id": '634d6f0464ae6e7cb8eb2aba', "name": "Mrs. Roberts"},
  {"id": '634d6f0464ae6e7cb8eb2abb', "name": "Gym Teacher"},
  {"id": '65fb7d1fad00b983e4104d2f', "name": 'Test User'}
]

// Set 1  - tie for last place, no anonymous stories

const kSet1Stories = [
    {
        "_id": "1",
        "type": "SW",
        "author": {_id: '63347c6774df38f3c7a84b5e',  name: 'Creative Arts Teacher '},
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}]
    },
    {
        "_id": "2",
        "author": {_id: '63347c6774df38f3c7a84b5e',  name: 'Creative Arts Teacher ',},
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}]
    },
    {
        "_id": "3",
        "author": {_id: '634ea3e4a2dfb20d344094aa', name: 'Kathy Hamblen'},
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}]
    },
    {
        "_id": "4",
        "author": {_id: '6346eb7b320debb0687f4f51', name: 'Erin Eppler '},
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}]
    },
    {
        "_id": "5",
        "author": {_id: '6346e9b4320debb0687f4e21', name: 'Brian Jandreau '},
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "C", "name": "C"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}],
        "promisingPractices": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}]
    },
    {
        "_id": "6",
        "author": {_id: '634d6f0464ae6e7cb8eb2ab8', name: 'Heather Perry '},
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
    {
      "_id": "7",
      "author": {_id: '634d6f0464ae6e7cb8eb2ab8', name: 'Heather Perry '},
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
    {
      "_id": "8",
      "author": {_id: '634d6f0464ae6e7cb8eb2ab9', name: 'Mr. Smith '},
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
    {
      "_id": "9",
      "author": {_id: '634d6f0464ae6e7cb8eb2aba', name: 'Mrs. Roberts'},
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
    {
      "_id": "10",
      "author": {_id: '634d6f0464ae6e7cb8eb2abb', name: 'Gym Teacher'},
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },

];

const kSet1Success =  [
  {"ranking": 1, "level": 0, "fullName": "Creative Arts Teacher ", "numStories": 2, "tooltipLabel": "Scribe: 1 to 5 stories"},
  {"ranking": 1, "level": 0, "fullName": "Heather Perry ", "numStories": 2, "tooltipLabel": "Scribe: 1 to 5 stories"},
  {"ranking": 2, "level": 0, "fullName": "Brian Jandreau ", "numStories": 1, "tooltipLabel": "Scribe: 1 to 5 stories"},
  {"ranking": 2, "level": 0, "fullName": "Erin Eppler ", "numStories": 1, "tooltipLabel": "Scribe: 1 to 5 stories"},
  {"ranking": 2, "level": 0, "fullName": "4 Additional Contributors", "numStories": 1, "tooltipLabel": "Scribe: 1 to 5 stories"},
];

// Set 2 - fewer than 5 contributors, no anonymous stories

const kSet2Stories = [
  {
      "_id": "1",
      "type": "SW",
      "author": {_id: '63347c6774df38f3c7a84b5e',  name: 'Creative Arts Teacher '},
      "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
      "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
      "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}]
  },
  {
      "_id": "2",
      "author": {_id: '63347c6774df38f3c7a84b5e',  name: 'Creative Arts Teacher ',},
      "type": "SW",
      "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
      "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
      "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}]
  }

];

const kSet2Success =  [
  {"ranking": 1, "level": 0, "fullName": "Creative Arts Teacher ", "numStories": 2, "tooltipLabel": "Scribe: 1 to 5 stories"},
];


// Set 3 - userIds with no author Ids( i.e.: anonymous stories )

const kSet3Stories = [
    {
        "_id": "1",
        "type": "SW",
        "userId": "659f0870ba3ab6c6ede99e0b",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}]
    },
    {
        "_id": "2",
        "userId": "634d6f0464ae6e7cb8eb2ab8",        
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}]
    },
    {
        "_id": "3",
        "userId": "65fb7d1fad00b983e4104d2f",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}]
    },
    {
        "_id": "4",
        "userId": "65fb7d1fad00b983e4104d2f",
        "type": "SW",
        "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
        "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
        "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}]
    },
    {
        "_id": "5",
        "userId": "659f0870ba3ab6c6ede99e0b",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "C", "name": "C"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}],
        "promisingPractices": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}]
    },
    {
        "_id": "6",
        "userId": "659f0870ba3ab6c6ede99e0b",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
    {
        "_id": "7",
        "userId": "6346e9b4320debb0687f4e21",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
    {
        "_id": "8",
        "userId": "6346e9b4320debb0687f4e21",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
    {
        "_id": "9",
        "userId": "6400e08b16ace8bf0aa34b70",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
    {
        "_id": "10",
        "userId": "6400e08b16ace8bf0aa34b70",
        "type": "SW",
        "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
        "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
    },
];

const kSet3Success : Array<Contributor> =  [
  {"ranking": 1, "level": 1, "fullName": "Anonymous Contributors", "numStories": 10, "tooltipLabel": "Raconteur: 6 to 10 stories"},


];


// Set 4 - stories with a mix of userIds and author Ids ( ie: some anonymous and some not )

const kSet4Stories = [
  {
      "_id": "1",
      "type": "SW",
      "author": {_id: '634d6f0464ae6e7cb8eb2ab8', name: 'Heather Perry '},
      "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
      "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}],
      "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "C", "name": "C"}]
  },
  {
      "_id": "2",
      "userId": "634d6f0464ae6e7cb8eb2ab8",
      "type": "SW",
      "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
      "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}],
      "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "D", "name": "D"}]
  },
  {
      "_id": "3",
      "userId": "634d6f0464ae6e7cb8eb2ab8",
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "D", "name": "D"}]
  },
  {
      "_id": "4",
      "author": {_id: '634d6f0464ae6e7cb8eb2ab9', name: 'Mr. Smith '},
      "userId": "634d6f0464ae6e7cb8eb2ab9",
      "type": "SW",
      "successSigns": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
      "studentCharacteristics": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}],
      "promisingPractices": [{ "_id": "A", "name": "A"}, { "_id": "F", "name": "F"}]
  },
  {
      "_id": "5",
      "userId": "634d6f0464ae6e7cb8eb2ab9",
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "C", "name": "C"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}],
      "promisingPractices": [{ "_id": "B", "name": "B"},{ "_id": "C", "name": "C"}]
  },
  {
      "_id": "6",
      "userId": "634d6f0464ae6e7cb8eb2ab9",
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
  },
  {
      "_id": "7",
      "userId": "6346e9b4320debb0687f4e21",
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
  },
  {
      "_id": "8",
      "userId": "6346e9b4320debb0687f4e21",
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
  },
  {
      "_id": "9",
      "userId": "65fb7d1fad00b983e4104d2f",
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
  },
  {
      "_id": "10",
      "author": {_id: '65fb7d1fad00b983e4104d2f', name: 'Test User'},
      "userId": "65fb7d1fad00b983e4104d2f",
      "type": "SW",
      "successSigns": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "studentCharacteristics": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}],
      "promisingPractices": [{ "_id": "B", "name": "B"}, { "_id": "E", "name": "E"}]
  },
];

const kSet4Success : Array<Contributor> =  [
  {"fullName": "Anonymous Contributors", "level": 1, "numStories": 7,"ranking": 1, "tooltipLabel": "Raconteur: 6 to 10 stories"},
  {"fullName": "Heather Perry ", "level": 0, "numStories": 1, "ranking": 2, "tooltipLabel": "Scribe: 1 to 5 stories"},
  {"fullName": "Mr. Smith ", "level": 0,  "numStories": 1,  "ranking": 2,  "tooltipLabel": "Scribe: 1 to 5 stories" },
  {"fullName": "Test User", "level": 0,  "numStories": 1,  "ranking": 2,  "tooltipLabel": "Scribe: 1 to 5 stories" },
];


global.fetch = jest.fn();

describe("useLeaderboard Set1 - tie for last place", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return values for Set 1", async () => {
    const { result } = renderHook(() => useLeaderboard(kSet1Stories));
    const rankedParticipants = result.current;

    // this being not wrapped in a waitFor causes the act errors in the console.
    expect( rankedParticipants).toStrictEqual( kSet1Success);


  });
});

describe("useLeaderboard Set2 - fewer than 5 contributors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return values for Set 2", async () => {
    const { result } = renderHook(() => useLeaderboard(kSet2Stories));
    const rankedParticipants = result.current;

    // this being not wrapped in a waitFor causes the act errors in the console.
    expect( rankedParticipants).toStrictEqual( kSet2Success);


  });
});

describe("useLeaderboard Set3 - userId with no author ( anonymous ) stories only", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("return values for Set 3", async () => {
      const { result } = renderHook(() => useLeaderboard(kSet3Stories));
      const rankedParticipants = result.current;
  
      // this being not wrapped in a waitFor causes the act errors in the console.
      expect( rankedParticipants).toStrictEqual( kSet3Success);
  });
});

describe("useLeaderboard Set4 - mix of anonymous and non-anonymous stories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return values for Set 4", async () => {
    const { result } = renderHook(() => useLeaderboard(kSet4Stories));
    const rankedParticipants = result.current;

    // this being not wrapped in a waitFor causes the act errors in the console.
    expect( rankedParticipants).toStrictEqual( kSet4Success);
  });
});


  