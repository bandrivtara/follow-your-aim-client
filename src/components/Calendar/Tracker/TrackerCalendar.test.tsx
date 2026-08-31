import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import useIsMobile from "share/hooks/useIsMobile";
import tableConfigs from "./tableConfigs";
import TrackerCalendar from "./TrackerCalendar";

jest.mock("store/services/habits", () => {
  const result = { data: [] };
  return { useGetHabitListQuery: () => result };
});
jest.mock("store/services/history", () => {
  const result = { data: [], isFetching: false };
  return { useGetHistoryBetweenDatesQuery: () => result };
});
jest.mock("store/services/taskGroups", () => {
  const result = { data: [] };
  return { useGetTaskGroupListQuery: () => result };
});
jest.mock("store/services/dailyReviews", () => {
  const result = { data: [], isFetching: false };
  return { useGetDailyReviewsBetweenDatesQuery: () => result };
});
jest.mock("share/hooks/useIsMobile", () => ({
  __esModule: true,
  default: jest.fn(() => true),
}));
jest.mock("share/hooks/useIsCompactLayout", () => () => true);
jest.mock("./DayCellEditor/DayCellEditor", () => () => null);
jest.mock("./trackerExport", () => ({
  buildTrackerExport: jest.fn(),
  downloadTrackerExport: jest.fn(),
}));
jest.mock("./tableConfigs", () => ({
  __esModule: true,
  default: { getColumnDefs: jest.fn(() => []), getRows: jest.fn(() => []) },
}));
jest.mock("ag-grid-react", () => ({
  AgGridReact: require("react").forwardRef(() => <div data-testid="grid" />),
}));
// The compact filter panel is collapsed; mode controls must live outside it.
jest.mock("./FiltersBar/FiltersBar", () => (props: any) => (
  <div>
    <output data-testid="period">{props.rangeMode}</output>
    <output data-testid="filter">{props.filteredCategory}</output>
    <button onClick={() => props.setFilteredCategory("planned")}>
      Тільки заплановані
    </button>
  </div>
));

test.each([true, false])(
  "switches modes outside compact filters (phone=%s) without changing the period",
  (phone) => {
    (useIsMobile as jest.Mock).mockReturnValue(phone);
    render(
      <MemoryRouter>
        <TrackerCalendar />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("radiogroup", { name: "Режим трекера" }),
    ).toBeVisible();
    expect(screen.getByRole("radio", { name: "Результати" })).toBeChecked();
    fireEvent.click(screen.getByText("Тільки заплановані"));
    fireEvent.click(screen.getByRole("radio", { name: "Планування" }));
    expect(screen.getByRole("radio", { name: "Планування" })).toBeChecked();
    expect(screen.getByTestId("filter")).toHaveTextContent("all");
    expect(screen.getByTestId("period")).toHaveTextContent(
      phone ? "day" : "week",
    );
    expect(tableConfigs.getColumnDefs).toHaveBeenLastCalledWith(
      expect.any(Array),
      "planning",
      phone,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Результати" }));
    expect(tableConfigs.getColumnDefs).toHaveBeenLastCalledWith(
      expect.any(Array),
      "tracking",
      phone,
    );
  },
);

test("preserves explicit planning links and week selection", () => {
  render(
    <MemoryRouter
      initialEntries={["/calendar/tracker?mode=planning&view=week"]}
    >
      <TrackerCalendar />
    </MemoryRouter>,
  );
  expect(screen.getByRole("radio", { name: "Планування" })).toBeChecked();
  expect(screen.getByTestId("period")).toHaveTextContent("week");
});
