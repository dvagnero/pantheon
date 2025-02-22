import React, { Component } from "react";
import {
  Drawer, DrawerPanelContent, DrawerContent, DrawerContentBody, DrawerHead, DrawerActions, DrawerCloseButton,
  Button, ButtonVariant,
  InputGroup,
  Select, SelectOption,
  Toolbar, ToolbarItem, ToolbarContent, ToolbarFilter, ToolbarToggleGroup, ToolbarGroup,
  SelectVariant,
  ExpandableSection,
  Checkbox,
  Divider,
  SimpleListItem, SimpleList,
  SearchInput,
  ToolbarChipGroup, ToolbarChip,
} from "@patternfly/react-core";

import { SearchResults } from "@app/searchResults";
import { BuildInfo } from "./components/Chrome/Header/BuildInfo"

import "@app/app.css";
import SearchIcon from "@patternfly/react-icons/dist/js/icons/search-icon";
import FilterIcon from "@patternfly/react-icons/dist/js/icons/filter-icon";
import { IAppState } from "@app/app"
import { BulkOperationMetadata } from "./bulkOperationMetadata";


export interface ISearchState {
  filterLabel: string
  isExpanded: boolean
  assembliesIsExpanded: boolean
  expandableSectionIsExpanded: boolean
  modulesIsExpanded: boolean
  productFilterIsExpanded: boolean
  repoFilterIsExpanded: boolean
  products: Array<{ name: string, id: string }>
  repositories: Array<{ name: string, id: string, checked: boolean }>
  filteredRepositories: Array<{ name: string, id: string, checked: boolean }>

  inputValue: string,
  statusIsExpanded: boolean,
  ctypeIsExpanded: boolean,
  filters: {
    ctype: any,
    status: any
  },

  productFilterValue: string
  repoFilterValue: string

  // metadata
  productsSelected: string[]
  repositoriesSelected: string[]
  documentsSelected: Array<{ cells: [string, { title: { props: { href: string } } }, string, string, string], selected: boolean }>
  contentTypeSelected: string
  isModalOpen: boolean
  isEditMetadata: boolean
}
class Search extends Component<IAppState, ISearchState> {
  private drawerRef: React.RefObject<HTMLInputElement>;
  private SearchResults;

  constructor(props) {
    super(props);
    this.SearchResults = React.createRef();
    this.state = {
      // states for drawer
      filterLabel: "repo",
      isExpanded: true,
      assembliesIsExpanded: true,
      expandableSectionIsExpanded: true,
      modulesIsExpanded: true,
      productFilterIsExpanded: true,
      repoFilterIsExpanded: true,
      products: [{ name: "", id: "" }],
      repositories: [{ name: "", id: "", checked: false }],
      filteredRepositories: [{ name: "", id: "", checked: false }],
      // states for toolbar
      inputValue: "",
      statusIsExpanded: false,
      ctypeIsExpanded: false,
      filters: {
        ctype: [],
        status: []
      },

      // filters
      productFilterValue: "",
      repoFilterValue: "",

      // search
      productsSelected: [],
      repositoriesSelected: [],

      // bulk operation
      documentsSelected: [],
      contentTypeSelected: "",
      isModalOpen: false,
      isEditMetadata: false,
    };
    this.drawerRef = React.createRef();

  }

  public componentDidMount() {

    // list repos inside the drawer
    this.getRepositories()
    // product and id used for Filter
    // this.getProducts()

    // TODO: enable resize
    // toolbar
    // window.addEventListener("resize", this.closeExpandableContent);
  }

  public componentWillMount() {
    // list repos inside the drawer
    this.getRepositories()
    // this.getProducts()
  }

  public componentWillUnmount() {
    // TODO: enable resize
    // toolbar
    // window.removeEventListener("resize", this.closeExpandableContent);
  }
  public render() {
    const { filterLabel, isExpanded, assembliesIsExpanded, modulesIsExpanded, productFilterIsExpanded, repoFilterIsExpanded, expandableSectionIsExpanded, repositories, inputValue, filters, statusIsExpanded, ctypeIsExpanded } = this.state;
    // console.log('content type selected', this.state.contentTypeSelected)
    const panelContent = (
      <DrawerPanelContent widths={{ lg: "width_25" }}>
        <DrawerHead>
          <span className="pf-c-title pf-m-2xl" tabIndex={isExpanded ? 0 : -1} ref={this.drawerRef}>Filters</span>
          <DrawerActions>
            <DrawerCloseButton onClick={this.onCloseClick} />
          </DrawerActions>
          <ExpandableSection className="filters-drawer filters-drawer--by-repo" toggleText="By repository" isActive={true} isExpanded={repoFilterIsExpanded} onToggle={this.onRepositoriesToggle}>
            <SearchInput
              placeholder="Filter"
              value={this.state.repoFilterValue}
              onChange={this.onChangeRepoFilter}
              onClear={(evt) => this.onChangeRepoFilter("", evt)}
              className='filters-drawer__repo-search'
            />
            {this.state.filteredRepositories && this.state.filteredRepositories.length > 0 &&
              <SimpleList aria-label="Repository List" className='repo-list-container'>
                {this.state.filteredRepositories.map((data) => (
                  <SimpleListItem key={data.id} className='repo-list filters-drawer__repo-list'>
                    <Checkbox label={data.name} aria-label="uncontrolled checkbox" id={data.id} onChange={this.onSelectRepositories} isChecked={data.checked} />
                  </SimpleListItem>
                ))}
              </SimpleList>
            }

          </ExpandableSection>
          <br />
          {/* <ExpandableSection toggleText="By product">
            <SearchInput
              placeholder="Filter"
              value={this.state.productFilterValue}
              onChange={this.onChangeProductFilter}
              onClear={(evt) => this.onChangeProductFilter("", evt)}
            />
            <SimpleList aria-label="Product List">
              {this.state.products.map((data) => (
                <SimpleListItem key={data.id}>
                  <Checkbox label={data.name} aria-label="uncontrolled checkbox" id={data.id} />
                </SimpleListItem>
              ))}
            </SimpleList>

          </ExpandableSection> */}
        </DrawerHead>
      </DrawerPanelContent>
    );
    const drawerContent = (
      <React.Fragment>
        <ExpandableSection toggleText="Modules" className="pf-c-title search-results__section search-results__section--module" isActive={true} isExpanded={modulesIsExpanded} onToggle={this.onModulesToggle}>
          <SearchResults
            ref={this.SearchResults}
            contentType="module"
            keyWord={this.state.inputValue}
            repositoriesSelected={this.state.repositoriesSelected}
            productsSelected={this.state.productsSelected}
            userAuthenticated={this.props.userAuthenticated}
            filters={this.state.filters}
            onGetdocumentsSelected={this.getdocumentsSelected}
            onSelectContentType={this.bulkEditSectionCheck}
            currentBulkOperation={this.state.contentTypeSelected}
            disabledClassname={this.state.contentTypeSelected == 'assembly' ? 'disabled-search-results' : ''}
          />

        </ExpandableSection>
        <br />
        <ExpandableSection toggleText="Assemblies" className="pf-c-title search-results__section search-results__section--assembly" isActive={true} isExpanded={assembliesIsExpanded} onToggle={this.onAssembliesToggle}>
          <SearchResults
            ref={this.SearchResults}
            contentType="assembly"
            keyWord={this.state.inputValue}
            repositoriesSelected={this.state.repositoriesSelected}
            productsSelected={this.state.productsSelected}
            userAuthenticated={this.props.userAuthenticated}
            filters={this.state.filters}
            onGetdocumentsSelected={this.getdocumentsSelected}
            onSelectContentType={this.bulkEditSectionCheck}
            currentBulkOperation={this.state.contentTypeSelected}
            disabledClassname={this.state.contentTypeSelected == 'module' ? 'disabled-search-results' : ''}
          />

        </ExpandableSection>
      </React.Fragment>
    );

    const statusMenuItems = [
      <SelectOption key="statusDraft" value="draft" label="Draft" className="dropdown-filter__option dropdown-filter__option--status dropdown-filter__option--draft" />,
      <SelectOption key="statusPublished" value="published" label="Published" className="dropdown-filter__option dropdown-filter__option--status dropdown-filter__option--published" />
    ];

    const contentTypeMenuItems = [
      <SelectOption key="ctypeConcept" value="CONCEPT" label="Concept" className="dropdown-filter__option dropdown-filter__option--content-type dropdown-filter__option--concept" />,
      <SelectOption key="ctypeProcedure" value="PROCEDURE" label="Procedure" className="dropdown-filter__option dropdown-filter__option--content-type dropdown-filter__option--procedure" />,
      <SelectOption key="ctypeReference" value="REFERENCE" label="Reference" className="dropdown-filter__option dropdown-filter__option--content-type dropdown-filter__option--reference" />
    ];

    const toggleGroupItems = (
      <React.Fragment>
        <ToolbarItem id="filters-bar__toolbar-toggle">
          <Button variant="tertiary" aria-expanded={isExpanded} onClick={this.onClick} icon={<FilterIcon />} />
        </ToolbarItem>
        <ToolbarItem>
          <InputGroup>
            <SearchInput
              className="filters-bar__name-search"
              name="textInput"
              id="textInput"
              placeholder="Find by name"
              type="search"
              aria-label="search input"
              onChange={this.onInputChange}
              onClear={this.onInputClear}
              value={inputValue}
            />
            <Button variant={ButtonVariant.control} aria-label="search button for search input">
              <SearchIcon />
            </Button>
          </InputGroup>
        </ToolbarItem>
        <ToolbarGroup variant="filter-group">
          <ToolbarFilter
            chips={filters.status}
            deleteChip={this.onDelete}
            deleteChipGroup={this.onDeleteGroup}
            categoryName="Status"
            className="dropdown-filter filters-bar__dropdown-filter filters-bar__dropdown-filter--status"
          >
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Status"
              onToggle={this.onStatusToggle}
              onSelect={this.onStatusSelect}
              selections={filters.status}
              isOpen={statusIsExpanded}
              placeholderText="Status"
            >
              {statusMenuItems}
            </Select>
          </ToolbarFilter>
          <ToolbarFilter chips={filters.ctype} deleteChipGroup={this.onDeleteGroup} deleteChip={this.onDelete} categoryName="Content Type" className="dropdown-filter filters-bar__dropdown-filter filters-bar__dropdown-filter--content-type">
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Content Type"
              onToggle={this.onCtypeToggle}
              onSelect={this.onCtypeSelect}
              selections={filters.ctype}
              isOpen={ctypeIsExpanded}
              placeholderText="Content Type"
            >
              {contentTypeMenuItems}
            </Select>
          </ToolbarFilter>
        </ToolbarGroup>
      </React.Fragment>
    );

    const toolbarItems = (
      <React.Fragment>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          {toggleGroupItems}
        </ToolbarToggleGroup>
        <ToolbarGroup variant="icon-button-group">
        </ToolbarGroup>
        {this.props.userAuthenticated && (this.props.isAuthor || this.props.isPublisher || this.props.isAdmin) && <ToolbarItem>
          <Button variant="primary" onClick={this.handleEditMetadata} data-testid="edit_metadata">Edit metadata</Button>
        </ToolbarItem>}
        {this.props.userAuthenticated && (this.props.isPublisher || this.props.isAdmin) && <ToolbarItem>
          <Button variant="primary" isAriaDisabled={true}>Publish</Button>
        </ToolbarItem>}
        {this.props.userAuthenticated && (this.props.isPublisher || this.props.isAdmin) && <ToolbarItem>
          <Button variant="primary" isAriaDisabled={true}>Unpublish</Button>
        </ToolbarItem>}

      </React.Fragment>
    );

    return (
      <React.Fragment>
        <Toolbar
          id="toolbar-with-filter"
          className="pf-m-toggle-group-container filters-bar__filters-wrapper"
          collapseListedFiltersBreakpoint="xl"
          clearAllFilters={this.onDelete}
        >
          <ToolbarContent>{toolbarItems}</ToolbarContent>
        </Toolbar>
        <Divider />
        <Drawer isExpanded={isExpanded} isInline={true} position="left" onExpand={this.onExpand}>
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody className="search-results">
              {drawerContent}
              {this.state.isEditMetadata && <BulkOperationMetadata 
                documentsSelected={this.state.documentsSelected}
                contentTypeSelected={this.state.contentTypeSelected}
                isEditMetadata={this.state.isEditMetadata}
                updateIsEditMetadata={this.updateIsEditMetadata}
              />}
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
        <BuildInfo />
      </React.Fragment>
    );
  }

  // methods for drawer
  private getRepositories = () => {
    const path = "/content/repositories.harray.1.json"
    const repos = new Array()
    fetch(path)
      .then((response) => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error(response.statusText)
        }
      })
      .then(responseJSON => {
        for (const repository of responseJSON.__children__) {
          repos.push({ name: repository.__name__, id: repository["jcr:uuid"] })
        }
        this.setState({
          repositories: repos,
          filteredRepositories: repos
        })
      })
      .catch((error) => {
        console.log(error)
      })

  }

  private getProducts = () => {
    const path = "/content/products.harray.1.json"
    const products = new Array()
    fetch(path)
      .then((response) => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error(response.statusText)
        }
      })
      .then(responseJSON => {
        for (const product of responseJSON.__children__) {
          products.push({ name: product.__name__, id: product["jcr:uuid"] })
        }
        this.setState({ products })
      })
      .catch((error) => {
        console.log(error)
      })

  }

  private onExpand = () => {
    this.drawerRef.current && this.drawerRef.current.focus()
  };

  private onClick = () => {
    const isExpanded = !this.state.isExpanded;
    this.setState({ isExpanded });
  };

  private onCloseClick = () => {
    this.setState({ isExpanded: false });
  };

  // methods for toolbar
  private onInputChange = newValue => {
    this.setState({ inputValue: newValue });
  };

  private onInputClear = (event) => {
    this.setState({ inputValue: "" })
  }

  private onSelect = (type, event, selection) => {
    const checked = event.target.checked;
    this.setState(prevState => {
      const prevSelections = prevState.filters[type];
      return {
        filters: {
          ...prevState.filters,
          [type]: checked ? [...prevSelections, selection] : prevSelections.filter(value => value !== selection)
        }
      };
    });
  };

  private onStatusSelect = (event, selection) => {
    this.onSelect("status", event, selection);
  };

  private onCtypeSelect = (event, selection) => {
    this.onSelect("ctype", event, selection);
  };

  private onDelete = (type: string | ToolbarChipGroup = "", id: string | ToolbarChip = "") => {
    if (type) {
      let filterType
      filterType = typeof type === "object" ? type.name : type
      filterType = type === 'Content Type' ? 'ctype' : type
      this.setState(prevState => {
        const newState = Object.assign(prevState);
        return {
          filters: {
            ...prevState.filters,
            [filterType.toLowerCase()]: newState.filters[filterType.toLowerCase()].filter(s => s !== id),

          }
        }
      });
    } else {
      this.setState({
        filters: {
          ctype: [],
          status: []
        }
      });
    }
  };

  private onDeleteGroup = type => {
    let filterType
    filterType = type === 'Content Type' ? 'ctype' : type
    this.setState(prevState => {
      return {
        filters: {
          ...prevState.filters,
          [filterType.toLowerCase()]: []
        }
      };
    });
  };

  private onStatusToggle = isExpanded => {
    this.setState({ statusIsExpanded: isExpanded });
  };

  private onCtypeToggle = isExpanded => {
    this.setState({ ctypeIsExpanded: isExpanded });
  };

  // methods for filter search
  private onChangeRepoFilter = (value, event) => {
    this.setState({ repoFilterValue: value });

    // check for input value
    if (value) {
      // filter and return repositories that include input value, and set state to the filtered list
      let filtered = this.state.repositories.filter(data => data.name.toLowerCase().includes(value.toLowerCase()))
      this.setState({ filteredRepositories: filtered })
    } else {
      this.setState({
        filteredRepositories: this.state.repositories
      })
    }
  };

  private onChangeProductFilter = (value, event) => {
    this.setState({
      productFilterValue: value
    });

    if (value) {
      let inputString = "";
      const matchFound = [{ name: "", id: "" }];

      this.state.products.map(data => {
        inputString = "" + data.name
        if (inputString.toLowerCase().includes(value.toLowerCase())) {
          matchFound.push(data)
        }
      });
      this.setState({ products: matchFound })
    } else {
      this.getProducts()
    }
  };

  private onSelectRepositories = (checked, event) => {
    let repositoriesSelected = new Array()
    let repositories

    repositories = this.state.repositories.map(item => {
      if (item.id === event.target.id) {
        item.checked = checked;
      }
      return item;
    });

    repositoriesSelected = repositories.map(item => {
      if (item.checked !== undefined && item.checked === true) {
        if (item.name !== undefined) {
          return item.name
        }
      }
    });

    // filter undefined values
    repositoriesSelected = repositoriesSelected.filter(r => r !== undefined)

    this.setState({
      repositories,
      repositoriesSelected
    });

  }

  // Method for ExpandableSection
  private onExpandableToggle = isExpanded => {
    this.setState({ expandableSectionIsExpanded: isExpanded });
  };

  private onModulesToggle = () => {
    const modulesIsExpanded = !this.state.modulesIsExpanded
    this.setState({ modulesIsExpanded });
  };

  private onAssembliesToggle = () => {
    const assembliesIsExpanded = !this.state.assembliesIsExpanded
    this.setState({ assembliesIsExpanded });
  };

  private onRepositoriesToggle = () => {
    const repoFilterIsExpanded = !this.state.repoFilterIsExpanded
    this.setState({ repoFilterIsExpanded });
  };

  // methods for bulk operation
  private getdocumentsSelected = (documentsSelected) => {
    this.setState({ documentsSelected })
  }

  private bulkEditSectionCheck = (contentTypeSelected) => {
    this.setState({ contentTypeSelected })
  }

  private handleEditMetadata = (event) => {
    this.setState({ isEditMetadata: !this.state.isEditMetadata })
  }

  private updateIsEditMetadata = (updateIsEditMetadata) => {
    this.setState({isEditMetadata: updateIsEditMetadata })
  }
}

export { Search }; 