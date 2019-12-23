import _ from "lodash";
import React, { ReactElement } from "react";
import { Col, DropdownButton, MenuItem, Row } from "react-bootstrap";
import BootstrapTable, { Column } from "react-bootstrap-table-next";
/* tslint:disable-next-line:no-import-side-effect no-submodule-imports
* Disabling this two rules is necessary for
* allowing the import of default styles that ReactTable needs
* to display properly even if some of them are overridden later
*/
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import ToolkitProvider, { CSVExport, Search, ToolkitProviderProps } from "react-bootstrap-table2-toolkit";
// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css";
import { default as globalStyle } from "../../styles/global.css";
import translate from "../../utils/translations/translate";
import { FluidIcon } from "../FluidIcon";
import { default as style } from "./index.css";
import { IHeader, ITableProps } from "./types";

const handleFormatter: ((value: string, row: { [key: string]: string }, rowIndex: number, key: IHeader)
=> string | ReactElement | undefined) =
(value: string, row: { [key: string]: string }, rowIndex: number, key: IHeader): string | ReactElement | undefined => {
  if (key.formatter !== undefined) {
    return key.formatter(value, row, rowIndex, key);
  }
};

const renderGivenHeaders: ((arg1: IHeader[]) => Column[]) =
  (headers: IHeader[]): Column[] => (headers.map((key: IHeader) => {
    const isFormatter: boolean = key.formatter !== undefined;
    const handleSort: ((dataField: string, order: SortOrder) => void) =
    (dataField: string, order: SortOrder): void => {
      if (key.onSort !== undefined) {
        key.onSort(dataField, order);
      }
    };

    return {
      align: key.align,
      dataField: key.dataField,
      filter: key.filter,
      formatExtraData: key,
      formatter: isFormatter ? handleFormatter : undefined,
      headerStyle: (): {} => ({
        whiteSpace: key.wrapped === undefined ? "nowrap" : key.wrapped ? "unset" : "nowrap",
        width: key.width,
      }),
      hidden: (key.visible) === undefined ? key.visible : !key.visible,
      onSort: handleSort,
      sort: true,
      style: (): {} => ({
        whiteSpace: key.wrapped === undefined ? "nowrap" : key.wrapped ? "unset" : "nowrap",
      }),
      text: key.header,
    };
  })
);

const renderDynamicHeaders: ((arg1: string[]) => Column[]) =
  (dataFields: string[]): Column[] => (
    dataFields.map((key: string, index: number) =>
      ({
          dataField: key,
          headerStyle: (): {} => ({ width: dataFields.length > 10 ? "150px" : undefined }),
          hidden: key === "uniqueId" ? true : false,
          sort: true,
          text: key,
      }
    ))
  );

const renderHeaders: ((arg1: ITableProps) => Column[]) =
  (props: ITableProps): Column[] => (
    props.headers.length > 0 ?
    renderGivenHeaders(props.headers) :
    renderDynamicHeaders(Object.keys(props.dataset[0]))
  );

const renderExportCsvButton: ((toolkitProps: ToolkitProviderProps) => JSX.Element) =
(toolkitProps: ToolkitProviderProps): JSX.Element => {
  const { ExportCSVButton } = CSVExport;

  return (
    <ExportCSVButton {...toolkitProps.csvProps} className={style.exportCsv}>
      <FluidIcon icon="export" />
      &nbsp;{translate.t("project.findings.exportCsv")}
    </ExportCSVButton>
  );
};

const renderTable: ((toolkitProps: ToolkitProviderProps, props: ITableProps, dataset: Array<{}>) => JSX.Element) =
  (toolkitProps: ToolkitProviderProps, props: ITableProps, dataset: Array<{}>): JSX.Element => {

    const sizePerPageRenderer: ((renderer: SizePerPageRenderer) => JSX.Element) =
    (renderer: SizePerPageRenderer): JSX.Element => {
      const { options, currSizePerPage, onSizePerPageChange} = renderer;
      const handleSelect: ((select: {}) => void) = (select: {}): void => {
        onSizePerPageChange(select as number);
      };
      const renderMenuItems: ((value: {page: number; text: string}, index: number) => JSX.Element) =
      (value: {page: number; text: string}, index: number): JSX.Element => (
          <MenuItem key={index} eventKey={value.page}>{value.page}</MenuItem>
        );

      return (
        <div>
          <DropdownButton title={currSizePerPage} id="pageSizeDropDown" onSelect={handleSelect}>
            {options.map(renderMenuItems)}
          </DropdownButton>
        </div>
      );
    };
    const paginationOptions: PaginationProps = {
      sizePerPage: props.pageSize,
      sizePerPageRenderer,
    };
    const handleTableChange: ((type: TableChangeType, newState: TableChangeNewState) => void) =
    (type: TableChangeType, newState: TableChangeNewState): void => {
      if (props.onTableChange !== undefined) {
        props.onTableChange(type, newState);
      }
    };
    const isPaginationEnable: boolean = !_.isEmpty(dataset) && dataset.length > props.pageSize;
    const { SearchBar } = Search;
    const handleNoData: (() => string) = (): string => (translate.t("no_data_indication"));

    return (
      <div>
        <Row>
          <Col lg={8} md={6} sm={6} xs={6}>
          {props.exportCsv ? renderExportCsvButton(toolkitProps) : undefined}
          </Col>
          <Col lg={4} md={6} sm={6} xs={6}>
            {props.search ? <SearchBar {...toolkitProps.searchProps} className={style.searchBar} /> : undefined}
          </Col>
        </Row>
        <BootstrapTable
          {...toolkitProps.baseProps}
          bordered={props.bordered}
          defaultSorted={!_.isUndefined(props.defaultSorted) ? [props.defaultSorted] : undefined}
          filter={filterFactory()}
          headerClasses={props.tableHeader === undefined ? style.tableHeader : props.tableHeader}
          hover={true}
          onTableChange={handleTableChange}
          noDataIndication={handleNoData}
          pagination={isPaginationEnable ? paginationFactory(paginationOptions) : undefined}
          remote={props.remote}
          rowClasses={props.tableBody === undefined ? style.tableBody : props.tableBody}
          rowEvents={props.rowEvents}
          selectRow={props.selectionMode}
          striped={props.striped}
        />
      </div>
    );
  };

const renderToolKitProvider: ((props: ITableProps, dataset: Array<{}>) => JSX.Element) =
  (props: ITableProps, dataset: Array<{}>): JSX.Element => (
    <div>
    {_.isEmpty(props.title) ? undefined : <h3 className={globalStyle.title}>{props.title}</h3>}
    <ToolkitProvider
      keyField={!_.isEmpty(dataset) && dataset.length > 0 ? "uniqueId" : "_"}
      data={dataset}
      columns={renderHeaders(props)}
      search={props.search}
      exportCSV={props.exportCsv}
    >
      {(toolkitProps: ToolkitProviderProps): JSX.Element => renderTable(toolkitProps, props, dataset)}
    </ToolkitProvider>
    </div>
  );

export const dataTableNext: React.FunctionComponent<ITableProps> = (props: ITableProps): JSX.Element => {
  let dataset: Array<{}>;
  if (!_.isEmpty(props.dataset) && props.dataset.length > 0) {
    dataset = props.dataset.map((data: {uniqueId: number}, index: number) => {
      data.uniqueId = index;

      return data;
    });
  } else {
    dataset = [];
  }

  return (
    <React.StrictMode>
      <div id={props.id}>
        {_.isEmpty(dataset) && _.isEmpty(props.headers) ? <div/> : renderToolKitProvider(props, dataset)}
      </div>
    </React.StrictMode>
  );
};

export { dataTableNext as DataTableNext };
