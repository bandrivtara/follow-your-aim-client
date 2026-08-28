import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useLocation } from "react-router-dom";
import AppLayout from "./AppLayout";

jest.mock("./useMenuItems", () => () => []);
jest.mock("share/components/NetworkStatus/NetworkStatus", () => () => null);

const originalMatchMedia = window.matchMedia;
const originalWidth = window.innerWidth;
let mediaListeners: Set<() => void>;

const resizeViewport = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  act(() => {
    Array.from(mediaListeners).forEach((listener) => listener());
    window.dispatchEvent(new Event("resize"));
  });
};

beforeEach(() => {
  mediaListeners = new Set();
  window.matchMedia = jest.fn((query: string) => ({
    get matches() {
      const max = query.match(/max-width:\s*(\d+)px/);
      const min = query.match(/min-width:\s*(\d+)px/);
      return (
        (!max || window.innerWidth <= Number(max[1])) &&
        (!min || window.innerWidth >= Number(min[1]))
      );
    },
    media: query,
    onchange: null,
    addListener: (listener: () => void) => {
      mediaListeners.add(listener);
    },
    removeListener: (listener: () => void) => {
      mediaListeners.delete(listener);
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: originalWidth,
  });
});

const Content = () => {
  const location = useLocation();
  return (
    <>
      <input aria-label="Незбережена нотатка" />
      <output data-testid="location">
        {location.pathname}
        {location.search}
      </output>
    </>
  );
};

const renderLayout = () =>
  render(
    <MemoryRouter>
      <AppLayout>
        <Content />
      </AppLayout>
    </MemoryRouter>,
  );

test.each([820, 1180, 1199])(
  "tablet width %i uses compact navigation without forcing day view",
  (width) => {
    resizeViewport(width);
    renderLayout();
    expect(
      screen.getByRole("button", { name: "Відкрити повне меню" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Трекер" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      /^\/calendar\/tracker$/,
    );
  },
);

test("phone navigation retains the daily tracker shortcut", () => {
  resizeViewport(393);
  renderLayout();
  fireEvent.click(screen.getByRole("button", { name: "Трекер" }));
  expect(screen.getByTestId("location")).toHaveTextContent(
    "/calendar/tracker?view=day",
  );
});

test.each([1200, 1440])("desktop width %i retains the sidebar", (width) => {
  resizeViewport(width);
  renderLayout();
  expect(
    screen.getByRole("button", { name: "Перейти на головну" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Відкрити повне меню" }),
  ).not.toBeInTheDocument();
});

test("rotating iPad or narrowing Split View does not remount an unsaved form", () => {
  resizeViewport(820);
  renderLayout();
  const input = screen.getByRole("textbox", { name: "Незбережена нотатка" });
  fireEvent.change(input, { target: { value: "Моя нотатка" } });
  for (const width of [1180, 820, 600, 820]) {
    resizeViewport(width);
    expect(screen.getByRole("textbox", { name: "Незбережена нотатка" })).toBe(
      input,
    );
    expect(input).toHaveValue("Моя нотатка");
  }
});
