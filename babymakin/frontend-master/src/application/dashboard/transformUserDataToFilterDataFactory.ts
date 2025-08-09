interface FilterModalData {
  districtSchools: any;
  schoolGoals: any;
  goalProperties: any;
  teams: any;
}

export const transformUserDataToFilterDataFactory = (
  userData: any = {}
): FilterModalData => {
  if (!userData)
    return {
      teams: [],
      districtSchools: {},
      goalProperties: {},
      schoolGoals: {},
    };
  const teams = userData?.teams;
  let schoolGoals: any,
    goalProperties: any = {};
  const districtSchools = userData?.schools?.reduce((data: any, sch: any) => {
    return (data[sch.district] = {
      _id: sch._id,
      name: sch.name,
      createdAt: sch.createdAt,
      district: sch.district,
    });
  }, {});

  schoolGoals = userData?.schools?.reduce((data: any, sch: any) => {
    const goals = sch.schoolGoals;
    return { ...data, [sch._id]: goals };
  }, {});
  if (schoolGoals && Object.keys(schoolGoals).length > 0) {
    const goals = Object.values(schoolGoals).flatMap((sch: any) => sch);
    goalProperties = goals?.reduce((data: any, gl: any) => {
      const goal = gl.goal;
      const promisingPractices = gl.promisingPractices;
      const studentCharacteristics = gl.studentCharacteristics;
      const successSigns = gl.successSigns;
      return {
        ...data,
        [goal._id]: {
          promisingPractices,
          studentCharacteristics,
          successSigns,
        },
      };
    }, {});
  }
  const data: FilterModalData = {
    teams,
    districtSchools,
    goalProperties,
    schoolGoals,
  };
  return data;
};
