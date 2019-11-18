/// <reference types="react" />

type RowFieldValue = string | number | Date | TODO;

type TODO = any;

interface Pagination extends TODO {
}

// TODO: check missings : https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/pagination-props.html
interface PaginationProps {
    page?: number;
    sizePerPage?: number;
    totalSize?: string;
    pageStartIndex?: number;
    paginationSize?: number;
    showTotal?: boolean;
    sizePerPageList?: { text: string, value: number }[];
    withFirstAndLast?: boolean;
    alwaysShowAllBtns?: boolean;
    firstPageText?: string;
    prePageText?: string;
    nextPageText?: string;
    lastPageText?: string;
    nextPageTitle?: string;
    prePageTitle?: string;
    firstPageTitle?: string;
    lastPageTitle?: string;
    hideSizePerPage?: boolean;
    hidePageListOnlyOnePage?: boolean;
    onPageChange?: (page: number, sizePerPage: number) => any;
    onSizePerPageChange?: (sizePerPage: number, page: number) => number;
    paginationTotalRenderer?: (from: number, to: number, size: number) => TODO;

    sizePerPageRenderer?: SizePerPageRenderer;
    handleNextPage?: (event: { page: number, onPageChange: () => void }) => void
    handlePrevPage?: (event: { page: number, onPageChange: () => void }) => void
    handleSizePerPage?: (event: { page: number, onSizePerPageChange: () => void },
        newSizePerPage: number) => void;
}

type PaginationProvider = React.Component<{
    pagination: Pagination;
    children: React.Component<{
        paginationProps: PaginationProps;
        paginationTableProps: PaginationProps;
    }>;
}>;

interface PaginationTableProps extends TODO {
}

interface SizePerPageRenderer {
    options: TODO[];
    currSizePerPage: number;
    onSizePerPageChange: TODO;
}

type onTableChange = (type: TableChangeType, event: TableChangeNewState) => TODO;

interface TableChangeNewState {
    page?: number;
    sizePerPage?: number;
    filters?: Filter<any>[];
    sortField?: string;
    sortOrder?: SortOrder;
    data?: RowT[]
}

type TableChangeType = 'filter' | 'pagination' | 'sort'

type SortOrder = 'asc' | 'desc' | TODO;

interface Sorted {
    defaultField?: string;
    order?: string;
}


interface FilterOptions {
    page: number;
    sizePerPage: number;
    totalSize: string;
    sizePerPageRenderer: SizePerPageRenderer;
}

interface Filter<Type extends TODO = TODO> {
    filterVal: FilterVal;
    filterType: FilterType;
    comparator: PredefinedComparatorTypes;
}

interface FilterProps<Type extends TODO> {
    getFilter?(filter: FilterFunction<Type>): TODO;
    defaultValue?: Type
    placeholder?: string
    className?: string
    style?: CSSStyleDeclaration
    delay?: number
    comparator?: PredefinedComparatorTypes
    caseSensitive?: true;
    comparatorStyle?: CSSStyleDeclaration,
    comparatorClassName?: string
    withoutEmptyComparatorOption?: boolean,
}

interface TextFilterProps extends FilterProps<TODO> {
}

interface DateFilterProps extends FilterProps<TODO> {
    dateStyle?: CSSStyleDeclaration,
    dateClassName?: string
    defaultValue?: { date: Date, comparator: PredefinedComparatorTypes }
}

interface SelectFilterProps extends FilterProps<TODO> {
    options?: { value: string | number, label: string }[] | string[];
    withoutEmptyOption?: boolean;
}

interface NumberFilterProps extends FilterProps<TODO> {
    options?: number[];
    withoutEmptyNumberOption?: boolean;
    comparators?: PredefinedComparatorTypes[];
    numberStyle?: CSSStyleDeclaration;
    numberClassName?: string;
    defaultValue?: { number: number, comparator: PredefinedComparatorTypes };
}

interface RemoteProps {
    filter?: boolean;
    pagination?: boolean;
    sort?: boolean;
}

interface CustomFilterProps {

    type: TODO//: FILTER_TYPES.NUMBER,  // default is FILTER_TYPES.TEXT
    comparator?: PredefinedComparatorTypes//: Comparator.EQ, // only work if type is FILTER_TYPES.SELECT
    caseSensitive?: boolean//false, // default is true
}

type FilterFunction<Type extends TODO> = (val: Type) => TODO

type FilterVal = string | TODO;

type FilterType = 'TEXT' | TODO;
declare enum PredefinedComparatorTypes { LIKE = 'LIKE', EQ = '=', NE = '!=', GT = '>', GE = '>=', LT = '<', LE = '<=' }

type PredefinedComparators = {
    [type in PredefinedComparatorTypes]: TODO;
};

// EDITOR

interface EditorProps {
}

// OVERLAY
interface OverlayOptions {
    spinner: boolean;
    background: Color;
}

type Color = string;

type Overlay = TODO

// SELECT AND EXPAND

interface SelectRowOptions { mode: 'checkbox', clickToSelect: boolean }
interface ExpandRowOptions { renderer: (row: any) => JSX.Element, showExpandColumn?: boolean }


declare module 'react-bootstrap-table-next' {

    export default class BootstrapTable<FieldIds extends string> extends React.Component<BootstrapTableProps<FieldIds>, TODO> {
    }
    export interface BootstrapTableProps<fieldIds extends string = string> extends PaginationProps {
        keyField: string;
        columns: Column<fieldIds>[];
        data: RowT<fieldIds>[];
        remote?: boolean | RemoteProps;
        bootstrap4?: boolean
        noDataIndication?(): JSX.Element;
        loading?: boolean;
        overlay?: Overlay;
        caption?: string | JSX.Element
        striped?: boolean
        defaultSorted?: Sorted[];
        filter?: FilterProps<TODO>;
        pagination?: Pagination;
        onTableChange?: onTableChange;


        selectRow?: SelectRowOptions
        expandRow?: ExpandRowOptions
    }

    export interface Column<FieldId extends string = string> {
        dataField: FieldId;
        text: string;
        isDummyField?: boolean
        hidden?: boolean
        sort?: boolean;
        formatter?: (cell: TODO, row: TODO, rowIndex: number, formatExtraData: any) => string
        filter?: TODO;
        sortFunc?<T>(a: T, b: T, order: 'asc' | 'desc', rowA: Row, rowB: Row): number
        filterValue?<T>(cell: T, row: TODO): any
    }

    export type Row = RowT
}
type RowT<Type extends TODO = TODO, FieldId extends string = string> = {
    [fieldName in FieldId]: RowFieldValue;
};
declare module "react-bootstrap-table2-filter" {
    export default function filterFactory<Type extends TODO>(options?: FilterOptions): FilterProps<Type>;
    function textFilter(props?: TextFilterProps): TODO;
    function dateFilter(props?: DateFilterProps): TODO;
    function selectFilter(props?: SelectFilterProps): TODO;
    function multiSelectFilter(props?: SelectFilterProps): TODO;
    function numberFilter(props?: NumberFilterProps): TODO;
    function customFilter(props?: CustomFilterProps): TODO;
    var Comparator: PredefinedComparators;
}

declare module "react-bootstrap-table2-paginator" {
    export default function paginationFactory(options?: PaginationProps): Pagination;
}

declare module "react-bootstrap-table2-overlay" {
    export default function overlayFactory(props?: OverlayOptions): Overlay;
}