import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "@/components/nav/PageHeader";

describe("PageHeader", () => {
  it("renders title, description, and badge content", () => {
    render(
      <PageHeader
        badge="Prototype data"
        description="A focused summary for the current route."
        eyebrow="Dashboard"
        title="What matters today"
      />,
    );

    expect(screen.getByText("What matters today")).toBeInTheDocument();
    expect(
      screen.getByText("A focused summary for the current route."),
    ).toBeInTheDocument();
    expect(screen.getByText("Prototype data")).toBeInTheDocument();
  });
});
