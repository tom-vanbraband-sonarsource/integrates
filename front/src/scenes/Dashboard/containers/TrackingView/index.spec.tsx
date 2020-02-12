import { MockedProvider, MockedResponse } from "@apollo/react-testing";
import { configure, mount, ReactWrapper, shallow, ShallowWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
// tslint:disable-next-line: no-import-side-effect
import "isomorphic-fetch";
import React from "react";
// tslint:disable-next-line: no-submodule-imports
import { act } from "react-dom/test-utils";
import { RouteComponentProps } from "react-router";
import wait from "waait";
import { TrackingView } from "./index";
import { GET_FINDING_TRACKING } from "./queries";

configure({ adapter: new ReactSixteenAdapter() });

describe("FindingExploitView", (): void => {

  const mockProps: RouteComponentProps<{ findingId: string }> = {
    history: {
      action: "PUSH",
      block: (): (() => void) => (): void => undefined,
      createHref: (): string => "",
      go: (): void => undefined,
      goBack: (): void => undefined,
      goForward: (): void => undefined,
      length: 1,
      listen: (): (() => void) => (): void => undefined,
      location: { hash: "", pathname: "/", search: "", state: {} },
      push: (): void => undefined,
      replace: (): void => undefined,
    },
    location: { hash: "", pathname: "/", search: "", state: {} },
    match: { isExact: true, params: { findingId: "422286126" }, path: "/", url: "" },
  };

  const mocks: ReadonlyArray<MockedResponse> = [{
    request: {
      query: GET_FINDING_TRACKING,
      variables: { findingId: "422286126" },
    },
    result: {
      data: {
        finding: {
          id: "422286126",
          tracking: [
            { closed: 0, cycle: 0, date: "2018-09-28", effectiveness: 0, open: 1 },
            { closed: 1, cycle: 1, date: "2019-01-08", effectiveness: 100, open: 0 },
          ],
        },
      },
    },
  }];

  it("should return a function", (): void => {
    expect(typeof (TrackingView))
      .toEqual("function");
  });

  it("should render", (): void => {
    const wrapper: ShallowWrapper = shallow(
      <TrackingView {...mockProps} />,
    );
    expect(wrapper)
      .toHaveLength(1);
  });

  it("should render timeline", async () => {
    const wrapper: ReactWrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TrackingView {...mockProps} />
      </MockedProvider>,
    );
    await act(async () => { await wait(0); wrapper.update(); });
    expect(wrapper.find("ul"))
      .toHaveLength(1);
    expect(wrapper.find("li"))
      .toHaveLength(2);
  });

  it("should render pending vulns", async () => {
    (window as typeof window & { userRole: string }).userRole = "analyst";
    const wrapper: ReactWrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TrackingView {...mockProps} />
      </MockedProvider>,
    );
    await act(async () => { await wait(0); wrapper.update(); });
    expect(wrapper.text())
      .toContain("Pending");
  });
});
