import { render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import Page from "~/routes/_main.tsx";

describe("mainpage", () => {
  it("should display username", async () => {
    const RemixStub = createRoutesStub([
      {
        path: "/",
        Component: Page,
        loader: async () => {
          return {
            name: "John Doe",
          };
        },
      },
    ]);
    render(<RemixStub />);
    await waitFor(() => screen.findByText("John Doe"));
  });

  it("should display floating menu when user clicks on username", async () => {
    const RemixStub = createRoutesStub([
      {
        path: "/",
        Component: Page,
        loader: async () => {
          return {
            name: "John Doe",
          };
        },
      },
    ]);
    render(<RemixStub />);
    const usernameButton = await screen.findByText("John Doe");
    usernameButton.click();
    await waitFor(() => screen.findByText("Settings"));
    await waitFor(() => screen.findByText("Log Out"));
  });
});
