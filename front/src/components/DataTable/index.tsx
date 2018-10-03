/* tslint:disable jsx-no-multiline-js
 * Disabling this rule is necessary for the sake of
 * readability of the code that dynamically creates the columns
 */
import PropTypes from "prop-types";
import React, { ReactElement } from "react";
import { Label } from "react-bootstrap";
import {
  BootstrapTable,
  DataAlignType,
  TableHeaderColumn,
} from "react-bootstrap-table";
/* tslint:disable-next-line:no-import-side-effect no-submodule-imports
 * Disabling this two rules is necessary for
 * allowing the import of default styles that ReactTable needs
 * to display properly even if some of them are overridden later
 */
import "react-bootstrap-table/dist/react-bootstrap-table.min.css";
import globalStyle from "../../styles/global.css";
import style from "./index.css";

interface ITableProps {
  /* tslint:disable-next-line:no-any
   * Disabling this rule is necessary because the dataset
   * array may contain different types since this is a
   * generic component
   */
  dataset: any[];
  enableRowSelection: boolean;
  exportCsv: boolean;
  headers: IHeader[];
  id: string;
  pageSize: number;
  search?: boolean;
  title: string;
  onClickRow(arg1: string | undefined): void;
}

interface IHeader {
  align?: DataAlignType;
  dataField: string;
  header: string;
  isDate: boolean;
  isStatus: boolean;
  width?: string;
  wrapped?: boolean;
}

const statusFormatter: ((value: string) => ReactElement<Label>) =
  (value: string): ReactElement<Label> => {
    let bgColor: string;

    switch (value) {
      case "Cerrado":
      case "Closed":
      case "Tratada":
      case "Solved":
        bgColor = "#31c0be";
        break;
      case "Abierto":
      case "Open":
      case "Pendiente":
      case "Unsolved":
        bgColor = "#f22";
        break;
      case "Parcialmente cerrado":
      case "Partially closed":
        bgColor = "#ffbf00";
        break;
      default:
        bgColor = "";
    }

    return (
      <Label
        style={{
          backgroundColor: bgColor,
        }}
      >
        {value}
      </Label>
    );
};

const dateFormatter: ((value: string) => string) =
  (value: string): string => {
  if (value.indexOf(":") !== -1) {

    return value.split(" ")[0];
  }

  return value;
};

const renderGivenHeaders: ((arg1: IHeader[]) => JSX.Element[]) =
  (headers: IHeader[]): JSX.Element[] => (
  headers.map((key: IHeader, index: number) =>
   (
    <TableHeaderColumn
      isKey={index === 0}
      className={style.th}
      dataAlign={key.align}
      dataField={key.dataField}
      dataFormat={
       key.isStatus ? statusFormatter :
                      (key.isDate ? dateFormatter :
                        (value: string): string => value)
      }
      dataSort={true}
      key={index}
      tdStyle={{
       textAlign: key.align,
       whiteSpace: key.wrapped === undefined ? "nowrap" :
       key.wrapped ? "unset" : "nowrap",
      }}
      width={key.width}
    >
      {key.header}
    </TableHeaderColumn>
   ))
);

const renderDynamicHeaders: ((arg1: string[]) => JSX.Element[]) =
  (dataFields: string[]): JSX.Element[] => (
  dataFields.map((key: string, index: number) =>
    (
      <TableHeaderColumn
        isKey={index === 0}
        className={style.th}
        dataField={key}
        dataSort={true}
        key={index}
        tdStyle={{
          whiteSpace: "unset",
        }}
      >
        {key}
      </TableHeaderColumn>
    ))
);

const renderHeaders: ((arg1: ITableProps) => JSX.Element[]) =
  (props: ITableProps): JSX.Element[] => (

  props.headers.length > 0 ?
  renderGivenHeaders(props.headers) :
  renderDynamicHeaders(Object.keys(props.dataset[0]))
);

const dataTable: React.StatelessComponent<ITableProps> =
  (props: ITableProps): JSX.Element => (
    <React.StrictMode>
      <div id={props.id}>
        {
          /* tslint:disable-next-line:strict-type-predicates
           * Disabling this rule is necessary because the following expression is
           * misbelived to be always false by the linter while it is necessary for
           * avoiding errors during data loading time, where the dataset is empty
           */
          props.dataset === undefined
          ? <div/>
          : <div>
              <h1 className={globalStyle.title}>{props.title}</h1>
              <BootstrapTable
                data={props.dataset}
                exportCSV={props.exportCsv}
                hover={true}
                options={{
                 onRowClick: (row: string): void => {
                   props.onClickRow(row);
                 },
                 sizePerPage: props.pageSize,
                }}
                pagination={props.dataset.length > props.pageSize}
                search={props.search}
                striped={true}
                selectRow={
                  props.enableRowSelection
                  ? {
                      clickToSelect: true,
                      mode: "radio",
                    }
                  : undefined
                }
              >
                {renderHeaders(props)}
              </BootstrapTable>
            </div>
        }
      </div>
    </React.StrictMode>
  );

dataTable.propTypes = {
  dataset: PropTypes.any.isRequired,
  enableRowSelection: PropTypes.bool,
  id: PropTypes.string,
  onClickRow: PropTypes.func,
  pageSize: PropTypes.number,
  title: PropTypes.string,
};

dataTable.defaultProps = {
  enableRowSelection: false,
  exportCsv: false,
  headers: [],
  onClickRow: (arg1: string): void => undefined,
  pageSize: 25,
  search: false,
};

export = dataTable;
