const ClassroomsOptions = (classrooms) => (
  <>
    <option
      key="not-key"
      value={null}
      selected
    >
      ------------
    </option>
    {
      // eslint-disable-next-line
      classrooms.map((classroom) => (
        <option
          id={`classroom-${classroom.id}`}
          key={classroom.name}
          value={classroom.name}
        >
          {classroom.name}
        </option>
      ))
    }
  </>
);

export default ClassroomsOptions;
