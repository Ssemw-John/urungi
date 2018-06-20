/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 07/07/16
 * Time: 09:17
 * To change this template use File | Settings | File Templates.
 */

app.controller('report_v2Ctrl', function ($scope, connection, $compile, queryModel, queryService, reportService, $routeParams, $timeout, $rootScope, bsLoadingOverlayService, grid, uuid2, c3Charts, report_v2Model, widgetsCommon, $location, PagerService) {
    $scope.promptsBlock = 'partials/report/promptsBlock.html';
    $scope.dateModal = 'partials/report/dateModal.html';
    $scope.linkModal = 'partials/report/linkModal.html';
    $scope.repeaterTemplate = 'partials/report/repeater.html';
    $scope.publishModal = 'partials/report/publishModal.html';
    $scope.columnFormatModal = 'partials/report/columnFormatModal.html';
    $scope.columnSignalsModal = 'partials/report/columnSignalsModal.html';
    $scope.filterPromptModal = 'partials/query/filter-prompt-modal.html';
    $scope.dropArea = 'partials/report_v2/drop-area.html';
    $scope.reportNameModal = 'partials/report_v2/reportNameModal.html';
    $scope.dashListModal = 'partials/report_v2/dashboardListModal.html';
    $scope.settingsTemplate = 'partials/widgets/common.html';
    $scope.tabs = {selected: 'elements'};

    $scope.fieldsAggregations = queryModel.fieldsAggregations;

    $scope.selectedReport = {};
    $scope.selectedReport.draft = true;
    $scope.selectedReport.badgeStatus = 0;
    $scope.selectedReport.exportable = true;
    $scope.selectedReport.badgeMode = 1;
    $scope.selectedReport.properties = {};
    $scope.selectedReport.properties.xkeys = [];
    $scope.selectedReport.properties.ykeys = [];
    $scope.selectedReport.properties.pivotKeys = {};
    $scope.selectedReport.properties.pivotKeys.columns = [];
    $scope.selectedReport.properties.pivotKeys.rows = [];
    $scope.selectedReport.properties.columns = [];
    $scope.selectedReport.properties.order = [];
    $scope.selectedReport.reportType = 'grid';
    $scope.selectedReport.query = {};

    $scope.duplicateOptions = {};
    $scope.duplicateOptions.freeze = false;
    $scope.duplicateOptions.header = 'Duplicate report';

    $scope.page = 1;

    $scope.gettingData = false;
    $scope.showSQL = false;

    $scope.rows = [];
    $scope.selectedLayerID = undefined;// queryModel.selectedLayerID();
    $scope.layers = queryModel.layers();
    $scope.mode = 'preview';
    $scope.isForDash = false;
    $scope.showPrompts = true;
    $scope.pager = {};

    $scope.selectedRecordLimit = { value: 500 };

    $scope.getSelectedLayer = function () {
        return queryModel.selectedLayerID();
    };

    // $scope.rootItem = {elementLabel: '', elementRole: 'root', elements: []};

    $scope.rootItem = queryModel.rootItem();

    $scope.fieldsAggregations = queryModel.fieldsAggregations;

    $scope.textAlign = widgetsCommon.textAlign;

    $scope.fontSizes = widgetsCommon.fontSizes;

    $scope.fontWeights = widgetsCommon.fontWeights;

    $scope.fontStyles = widgetsCommon.fontStyles;

    $scope.colors = widgetsCommon.colors;

    $scope.signalOptions = widgetsCommon.signalOptions;

    $scope.queryModel = queryModel;

    $scope.getPrompts = function () {
        if ($scope.selectedReport.query) { return $scope.selectedReport.query.groupFilters; };
    };

    $scope.getSQLPanel = function () {
        $scope.showSQL = !$scope.showSQL;
    };

    $scope.onDateSet = function (newDate, oldDate, filter) {
        queryModel.onDateSet(newDate, oldDate, filter);
    };

    $scope.onDateEndSet = function (newDate, oldDate, filter) {
        queryModel.onDateEndSet(newDate, oldDate, filter);
    };

    $scope.removeItem = function (item, collection) {
        var id = collection.indexOf(item);
        collection.splice(id, 1);
    };

    $scope.$on('newReport', function (event, args) {
        // $scope.initReport();
    });

    $scope.$on('newReportForDash', function (event, args) {
        $scope.mode = 'add';
        $scope.isForDash = true;

        $scope.selectedReport = {};
        $scope.selectedReport.id = uuid2.newguid();
        $scope.selectedReport.draft = true;
        $scope.selectedReport.badgeStatus = 0;
        $scope.selectedReport.exportable = true;
        $scope.selectedReport.badgeMode = 1;
        $scope.selectedReport.properties = {};
        $scope.selectedReport.properties.xkeys = [];
        $scope.selectedReport.properties.ykeys = [];
        $scope.selectedReport.properties.columns = [];
        $scope.selectedReport.reportType = 'grid';
        $scope.selectedReport.query = {};
        queryModel.initQuery();
    });

    $scope.$on('loadReportStrucutureForDash', function (event, args) {
        // UNA QUERY SOLO PUEDE PERTENECER A UNA LAYER POR LO QUE EN LUGAR DE LAYERS ES LAYERID
        // VER TB POR QUE HAY MAS DE UNA LAYER EN QUERY Y A NULL
        var report = args.report;
        $scope.isForDash = true;
        $scope.showOverlay('OVERLAY_reportLayout');
        $scope.selectedReport = report;
        $scope.mode = 'edit';
        queryModel.loadQuery(report.query);
        queryModel.detectLayerJoins();
        report_v2Model.getReport(report, 'reportLayout', $scope.mode).then(() => {
            $scope.hideOverlay('OVERLAY_reportLayout');
        });
    });

    $scope.showOverlay = function (referenceId) {
        bsLoadingOverlayService.start({
            referenceId: referenceId
        });
    };

    $scope.hideOverlay = function (referenceId) {
        bsLoadingOverlayService.stop({
            referenceId: referenceId
        });
    };

    $scope.saveReportStructure = function () {
        var clonedReport = $scope.selectedReport;
        reportService.addReport(clonedReport);
    };

    $scope.stringVariables = [
        {value: 'toUpper', label: 'To Upper'},
        {value: 'toLower', label: 'To Lower'}
    ];

    if ($routeParams.extra === 'intro') {
        $timeout(function () { $scope.showIntro(); }, 1000);
    }

    $scope.initLayers = function () {
        queryModel.getLayers().then((layers) => {
            $scope.layers = layers;
            $scope.selectedLayerID = queryModel.selectedLayerID();
        });
    };

    $scope.newForm = function () {
        $scope.selectedReport = {};
        $scope.selectedReport.draft = true;
        $scope.selectedReport.badgeStatus = 0;
        $scope.selectedReport.exportable = true;
        $scope.selectedReport.badgeMode = 1;
        $scope.selectedReport.properties = {};
        $scope.selectedReport.properties.xkeys = [];
        $scope.selectedReport.properties.ykeys = [];
        $scope.selectedReport.properties.columns = [];
        /// $scope.selectedReport.properties.filters = [];
        $scope.selectedReport.properties.order = [];
        $scope.selectedReport.properties.pivotKeys = {};
        $scope.selectedReport.properties.pivotKeys.columns = [];
        $scope.selectedReport.properties.pivotKeys.rows = [];
        $scope.selectedReport.properties.order = [];
        $scope.selectedReport.reportType = 'grid';

        $scope.selectedReport.properties.backgroundColor = '#FFFFFF';
        $scope.selectedReport.properties.height = 400;
        $scope.selectedReport.properties.headerHeight = 60;
        $scope.selectedReport.properties.rowHeight = 35;
        $scope.selectedReport.properties.headerBackgroundColor = '#FFFFFF';
        $scope.selectedReport.properties.headerBottomLineWidth = 4;
        $scope.selectedReport.properties.headerBottomLineColor = '#999999';
        $scope.selectedReport.properties.rowBorderColor = '#CCCCCC';
        $scope.selectedReport.properties.rowBottomLineWidth = 2;
        $scope.selectedReport.properties.columnLineWidht = 0;

        $scope.selectedReport.reportType = 'grid';
        $scope.selectedLayerID = queryModel.selectedLayerID();
        $scope.mode = 'add';
    };

    $scope.initForm = async function () {
        if ($routeParams.reportID && $routeParams.reportID !== 'true') {
            const report = await report_v2Model.getReportDefinition($routeParams.reportID, false);
            if (report) {
                $scope.showOverlay('OVERLAY_reportLayout');
                $scope.selectedReport = report;
                $scope.mode = 'edit';
                $scope.cleanForm();
                await report_v2Model.getReport(report, 'reportLayout', $scope.mode);
                $scope.selectedLayerID = queryModel.selectedLayerID();
                $scope.hideOverlay('OVERLAY_reportLayout');
            } else {

                // TODO:No report found message
            }
        } else {
            $scope.newForm();
            queryModel.initQuery();
        }
    };

    $scope.cleanForm = function () {
        if (!$scope.selectedReport.properties) {
            $scope.initForm();
        } else {
            if (!$scope.selectedReport.properties.xkeys) { $scope.selectedReport.properties.xkeys = []; }
            if (!$scope.selectedReport.properties.ykeys) { $scope.selectedReport.properties.ykeys = []; }
            if (!$scope.selectedReport.properties.columns) { $scope.selectedReport.properties.columns = []; }
            if (!$scope.selectedReport.properties.order) { $scope.selectedReport.properties.order = []; }
            if (!$scope.selectedReport.properties.pivotKeys) { $scope.selectedReport.properties.pivotKeys = {}; }
            if (!$scope.selectedReport.properties.pivotKeys.columns) { $scope.selectedReport.properties.pivotKeys.columns = []; }
            if (!$scope.selectedReport.properties.pivotKeys.rows) { $scope.selectedReport.properties.pivotKeys.rows = []; }
            if (!$scope.selectedReport.properties.order) { $scope.selectedReport.properties.order = []; }
        }
    };

    $scope.getReports = function (params) {
        params = params || {};

        connection.get('/api/reports/find-all', params, function (data) {
            $scope.reports = data;
        });
    };

    $scope.getReports = function (page, search, fields) {
        var params = {};

        params.page = (page) || 1;

        if (search) {
            $scope.search = search;
        } else if (page === 1) {
            $scope.search = '';
        }
        if ($scope.search) {
            params.search = $scope.search;
        }

        if (fields) params.fields = fields;

        connection.get('/api/reports/find-all', params, function (data) {
            $scope.reports = data;
            // $scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.pager = PagerService.GetPager($scope.reports.items.length, data.page, 10, data.pages);
        });
    };

    $scope.viewDuplicationForm = function (report) {
        $scope.duplicateOptions.report = report;
        $scope.duplicateOptions.newName = report.reportName + ' copy';
        $('#duplicateModal').modal('show');
    };

    $scope.duplicateReport = async function () {
        $scope.duplicateOptions.freeze = true;
        await report_v2Model.duplicateReport($scope.duplicateOptions);
        $scope.getReports($scope.page, '', ['reportName', 'reportType', 'isPublic', 'owner', 'reportDescription']);
        $scope.duplicateOptions.freeze = false;
        $('#duplicateModal').modal('hide');
    };

    $scope.duplicateOptions.duplicate = $scope.duplicateReport;

    $scope.IntroOptions = {
        // IF width > 300 then you will face problems with mobile devices in responsive mode
        steps: [
            {
                element: '#parentIntroReports',
                html: '<div><h3>Reports</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Here you can create and execute reports.</span><br/><br/><iframe width="350" height="225" src="https://www.youtube.com/embed/_g1NcBIgGQU" frameborder="0" allowfullscreen></iframe><br/><br/><span>Watch this short tutorial to see how to create a report.</span></div>',
                width: '500px',
                objectArea: false,
                verticalAlign: 'top',
                height: '400px'
            },
            {
                element: '#parentIntroReports',
                html: '<div><h3>Reports</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span>Choose a report type and drag and drop elements from the selected layer to compose your report.</span><br/><br/><span>You can also add runtime filters to split your data in real time.</span><br/><br/><span></span></div>',
                width: '350px',
                objectArea: false,
                verticalAlign: 'top',
                height: '200px'
            },
            {
                element: '#newReportBtn',
                html: '<div><h3>New Report</h3><span style="font-weight:bold;">Click here to create a new report.</span><br/><span></span></div>',
                width: '300px',
                height: '150px',
                areaColor: 'transparent',
                horizontalAlign: 'right',
                areaLineColor: '#fff'
            },
            {
                element: '#reportList',
                html: '<div><h3>Reports list</h3><span style="font-weight:bold;">Here all your reports are listed.</span><br/><span>Click over a report\'s name to execute it.<br/><br/>You can also modify or drop the report, clicking into the modify or delete buttons.</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                verticalAlign: 'top',
                height: '180px'

            },
            {
                element: '#reportListItem',
                html: '<div><h3>Report</h3><span style="font-weight:bold;">This is one of your reports.</span><br/><span>On every line (report) you can edit or drop it. If the report is published a green "published" label will be shown.</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#72A230',
                height: '180px'

            },
            {
                element: '#reportListItemName',
                html: '<div><h3>Report name</h3><span style="font-weight:bold;">The name for the report.</span><br/><br/><span>You can setup the name you want for your report, but think about make it descriptive enought, and take care about not duplicating names across the company, specially if the report is going to be published.</span><br/><br/><span>You can click here to execute the report.</span></div>',
                width: '400px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                height: '250px'

            },
            {
                element: '#reportListItemDetails',
                html: '<div><h3>Report description</h3><span style="font-weight:bold;">Use the description to give your users more information about the data or kind of data they will access using this report.</span><br/><span></span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                height: '180px'

            },
            {
                element: '#reportListItemEditBtn',
                html: '<div><h3>Report edit</h3><span style="font-weight:bold;">Click here to modify the report.</span><br/><br/><span></span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                horizontalAlign: 'right',
                height: '200px'

            },
            {
                element: '#reportListItemDeleteBtn',
                html: '<div><h3>Report delete</h3><span style="font-weight:bold;">Click here to delete the report.</span><br/><br/><span>Once deleted the report will not be recoverable again.</span><br/><br/><span>Requires 2 step confirmation.</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                horizontalAlign: 'right',
                height: '200px'

            },
            {
                element: '#reportListItemPublished',
                html: '<div><h3>Report published</h3><span style="font-weight:bold;">This label indicates that this report is public.</span><br/><br/><span>If you drop or modify a published report, it will have and impact on other users, think about it before making any updates on the report.</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                horizontalAlign: 'right',
                height: '200px'

            },
            {
                element: '#dataObjectsIntroBlock',
                html: '<div><h3>The layer catalog</h3><span style="font-weight:bold;">Access here the different data elements of every layer that you have access on</span><br/><span>Select elements and drag and drop them over the query design zone, depending if the element is going to be used as a column result (columns area), as a filter (filters area) or as an element to order by the results of the query (order by area)</span></div>',
                width: '300px',
                height: '250px'
            },
            {
                element: '#selectLayer',
                html: '<div><h3>The layer selector</h3><span style="font-weight:bold;">Select here the layer where your query will be based on.</span><br/><span>One query can only be baes in just one layer, you can not mix elements from different layers in the same query</span></div>',
                width: '300px',
                height: '250px',
                areaColor: 'transparent',
                areaLineColor: '#8DC63F'

            },

            {
                element: '#reportType',
                html: '<div><h3>Report Type selector</h3><span style="font-weight:bold;">Click over one of the different report types to change the visualization of the data you choose</span><br/><span></span></div>',
                width: '300px',
                areaColor: 'transparent',
                height: '180px'
            },
            {
                element: '#columnsPanel',
                html: '<div><h3>Columns / results drop zone</h3><span style="font-weight:bold;">Drop here the elements you want to have in the results of the query</span><br/><span>A query must hold at least one element here to be executed</span></div>',
                width: '300px',
                height: '180px'
            },
            {
                element: '#orderByPanel',
                html: '<div><h3>Order By drop zone</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;"> Drop here the elements that you want to use to order the results of the query</span><br/><span> The elements you drop in here do not necessarily have to be in the columns/results area, a query can be ordered by elements that do not appear in the results</span></div>',
                width: '300px',
                height: '250px'
            },
            {
                element: '#filtersPanel',
                html: '<div><h3>Filters drop zone</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Drop here the elements that you want to use to filter the results of the query</span><br/><span> The elements you drop in here do not necessarily have to be in the columns/results area, a query can be filtered by elements that do not appear in the results</span></div>',
                width: '300px',
                height: '250px',
                areaColor: 'transparent',
                areaLineColor: '#fff'
            },
            {
                element: '#reportLayout',
                html: '<div><h3>Results area</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">As you define the query draging and droping in the areas above, the results of the query will appear here</span><br/><span></span></div>',
                width: '300px',
                height: '150px',
                areaColor: 'transparent',
                areaLineColor: '#fff'
            },
            {
                element: '#queryRefresh',
                html: '<div><h3>Query refresh</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Use this button to refresh the results</span><br/><span>The query will be sent again to the server an executed to get the most up to date data</span></div>',
                width: '300px',
                height: '150px',
                areaColor: 'transparent',
                areaLineColor: '#fff'
            },
            {
                element: '#saveQueryForPageBtn',
                html: '<div><h3>Save query for page report</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Once you complete your query, click this button to save the query and back to the page report design</span><br/><span>The results of the query will be then used in the page report to create charts and data grids across the page.</span></div>',
                width: '300px',
                height: '200px',
                horizontalAlign: 'right',
                areaColor: 'transparent',
                areaLineColor: '#fff'
            }

        ]
    };

    $scope.changeLayer = function (selectedLayerID) {
        // $scope.selectedLayer = selectedLayerID;
        queryModel.changeLayer(selectedLayerID);
        $scope.selectedLayerID = queryModel.selectedLayerID();
    };

    $scope.detectLayerJoins = function () {
        queryModel.detectLayerJoins();
    };

    $scope.getQuery = function (queryID) {
        return queryModel.query();
    };

    $scope.getReport = function (hashedID) {
        return $scope.selectedReport;
    };

    $scope.getReportColumnDefs = function (reportID) {
        return $scope.selectedReport.properties.columnDefs;
    };

    $scope.getView = function (item) {
        if (item) {
            return 'nestable_item.html';
        }
        return null;
    };

    $scope.processStructure = function (execute) {
        queryModel.processStructure(execute, function () {
            $scope.getDataForPreview();
        });
    };

    $scope.getDatePatternFilters = function () {
        return queryModel.getDatePatternFilters();
    };

    $scope.onChangeDropZone = function () {
        queryModel.onChange();
    };

    $scope.onDropField = function (newItem, queryBind) {
        $scope.sql = undefined;
        queryModel.onDropTemp(newItem, queryBind);
    };

    $scope.onRemoveField = function (item, queryBind) {
        $scope.sql = undefined;
        queryModel.removeQueryItem(item, queryBind);
    };

    $scope.toReportItem = function (ngModelItem) {
        var agg;
        var aggLabel = '';

        if (ngModelItem.aggregation) {
            agg = ngModelItem.aggregation;
            aggLabel = ' (' + ngModelItem.aggregation + ')';
        }

        if (ngModelItem.defaultAggregation) {
            agg = ngModelItem.defaultAggregation;
            aggLabel = ' (' + ngModelItem.defaultAggregation + ')';
        }

        return {
            elementName: ngModelItem.elementName,
            objectLabel: ngModelItem.elementLabel + aggLabel,
            datasourceID: ngModelItem.datasourceID,
            id: ngModelItem.id,
            elementLabel: ngModelItem.elementLabel,
            collectionID: ngModelItem.collectionID,
            elementID: ngModelItem.elementID,
            elementType: ngModelItem.elementType,
            layerID: $scope.selectedLayerID,
            filterType: 'equal',
            filterPrompt: false,
            filterTypeLabel: 'equal',
            format: ngModelItem.format,
            values: ngModelItem.values,
            aggregation: agg
        };
    };

    $scope.autoFill = function (ngModelItem) {
        var choice;

        switch ($scope.selectedReport.reportType) {
        case 'grid':
        case 'vertical-grid':
            choice = {
                propertyBind: $scope.selectedReport.properties.columns,
                zone: 'columns',
                queryBind: 'column'
            };
            break;

        case 'pivot':
            if ($scope.selectedReport.properties.pivotKeys.rows.length === 0) {
                choice = {
                    propertyBind: $scope.selectedReport.properties.pivotKeys.rows,
                    zone: 'prow',
                    queryBind: 'column'
                };
            } else {
                if ($scope.selectedReport.properties.pivotKeys.columns.length === 0) {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.pivotKeys.columns,
                        zone: 'pcol',
                        queryBind: 'column'
                    };
                } else {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.ykeys,
                        zone: 'ykeys',
                        queryBind: 'column',
                        forceAggregation: true
                    };
                }
            }
            break;

        case 'chart-bar':
        case 'chart-line':
        case 'chart-area':
        case 'chart-pie':
        case 'chart-donut':
            if ($scope.selectedReport.properties.xkeys.length === 0) {
                choice = {
                    propertyBind: $scope.selectedReport.properties.xkeys,
                    zone: 'xkeys',
                    queryBind: 'column'
                };
            } else {
                if ($scope.selectedReport.properties.ykeys.length === 0 || $scope.selectedReport.properties.order.length > 0) {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.ykeys,
                        zone: 'ykeys',
                        queryBind: 'column'
                    };
                } else {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.order,
                        zone: 'order',
                        queryBind: 'order'
                    };
                }
            }
            break;

        case 'indicator':
        case 'vectorMap':
        case 'gauge':
            choice = {
                propertyBind: $scope.selectedReport.properties.ykeys,
                zone: 'ykeys',
                queryBind: 'column'
            };
            break;
        }

        const newItem = $scope.toReportItem(ngModelItem);
        newItem.zone = choice.zone;

        if (newItem.aggregation && (newItem.zone === 'pcol' || newItem.zone === 'prow')) {
            if (typeof newItem.originalLabel === 'undefined') {
                newItem.originalLabel = newItem.elementLabel;
            }
            delete (newItem.aggregation);
            newItem.elementLabel = newItem.originalLabel;
            newItem.objectLabel = newItem.originalLabel;
        }

        var found = false;
        for (const item of choice.propertyBind) {
            if (item.elementID === newItem.elementID) { found = true; }
        }
        if (!found) {
            choice.propertyBind.push(newItem);
        }

        $scope.onDropField(newItem, choice.queryBind);
    };

    $scope.filterSortableOptions = {
        stop: function (e, ui) {
            reorderFilters();
        }
    };

    function reorderFilters () {
        queryModel.reorderFilters();
    }

    $scope.delete = function (reportID, reportName) {
        $scope.modalOptions = {};
        $scope.modalOptions.headerText = 'Confirm delete report';
        $scope.modalOptions.bodyText = 'Are you sure you want to delete the report:' + ' ' + reportName;
        $scope.modalOptions.ID = reportID;
        $('#deleteModal').modal('show');
    };

    $scope.deleteConfirmed = function (reportID) {
        connection.post('/api/reports/delete/' + reportID, {id: reportID}, function (result) {
            if (result.result === 1) {
                $('#deleteModal').modal('hide');

                var nbr = -1;
                for (var i in $scope.reports.items) {
                    if ($scope.reports.items[i]._id === reportID) { nbr = i; }
                }

                if (nbr > -1) { $scope.reports.items.splice(nbr, 1); }
            }
        });
    };

    $scope.filtersUpdated = function () {
        queryModel.filtersUpdated();
    };

    $scope.onDragOver = function (event) {
        // ...
    };

    $scope.filterChanged = function (elementID, values) {
        queryModel.processStructure();
    };

    $scope.setHeight = function (element, height, correction) {
        height = (height === 'full') ? $(document).height() : height;

        if (correction) height = height + correction;

        $('#' + element).css('height', height);
    };

    $scope.setFilterPrompt = function (filter) {
        $('#filterPromptsModal').modal('hide');
        if (filter.filterPrompt) {
            filter.filterPrompt = false;
        } else { filter.filterPrompt = true; }
    };

    $scope.getButtonFilterPromptMessage = function (filter) {
        if (filter.filterPrompt) { return 'Select to deactivate the runtime'; } else { return 'Make this filter appear in the report interface.'; }
    };

    $scope.filterPromptsClick = function (filter) {
        $scope.selectedFilter = filter;
        if (!$scope.selectedFilter.promptTitle || $scope.selectedFilter.promptTitle === '') { $scope.selectedFilter.promptTitle = $scope.selectedFilter.objectLabel; }
        $('#filterPromptsModal').modal('show');
    };

    $scope.isfilterComplete = function (filter) {
        return queryModel.isfilterComplete(filter);
    };

    $scope.getDataForPreview = function () {
        $scope.page = 1;

        var query = queryModel.generateQuery(); // queryModel.query();
        // TODO: clean data query

        const limit = $scope.selectedRecordLimit.value;

        $scope.selectedReport.query = query;

        if ($scope.selectedReport.query.columns.length > 0) {
            var el = document.getElementById('reportLayout');
            angular.element(el).empty();
            $scope.gettingData = true;
            $scope.showOverlay('OVERLAY_reportLayout');

            switch ($scope.selectedReport.reportType) {
            case 'grid':
            case 'vertical-grid':
            case 'pivot':
                report_v2Model.getReport($scope.selectedReport, 'reportLayout', $scope.mode, limit).then(data => {
                    $scope.sql = data.sql;
                    $scope.time = data.time;
                    $scope.hideOverlay('OVERLAY_reportLayout');
                    $scope.gettingData = false;
                });
                break;

            case 'chart-line':
            case 'chart-donut':
            case 'chart-pie':
                if ($scope.selectedReport.properties.xkeys.length > 0 && $scope.selectedReport.properties.ykeys.length > 0) {
                    const theChartID = 'Chart' + uuid2.newguid();
                    $scope.selectedReport.properties.chart = {chartID: theChartID, dataPoints: [], dataColumns: [], datax: {}, height: 300, type: 'bar', query: query, queryName: null};
                    // $scope.selectedReport.properties.chart.query = query;
                    $scope.selectedReport.properties.chart.dataColumns = $scope.selectedReport.properties.ykeys;

                    const customObjectData = $scope.selectedReport.properties.xkeys[0];
                    $scope.selectedReport.properties.chart.dataAxis = {elementName: customObjectData.elementName,
                        queryName: 'query1',
                        elementLabel: customObjectData.objectLabel,
                        id: customObjectData.id,
                        type: 'bar',
                        color: '#000000'};
                    report_v2Model.getReport($scope.selectedReport, 'reportLayout', $scope.mode, limit).then(data => {
                        $scope.sql = data.sql;
                        $scope.time = data.time;
                        $scope.hideOverlay('OVERLAY_reportLayout');
                        $scope.gettingData = false;
                    });
                }
                break;

            case 'gauge':
                const theChartID = 'Chart' + uuid2.newguid();
                $scope.selectedReport.properties.chart = {chartID: theChartID, dataPoints: [], dataColumns: [], datax: {}, height: 300, type: 'bar', query: query, queryName: null};
                $scope.selectedReport.properties.chart.dataColumns = $scope.selectedReport.properties.ykeys;
                report_v2Model.getReport($scope.selectedReport, 'reportLayout', $scope.mode, limit).then(data => {
                    $scope.sql = data.sql;
                    $scope.time = data.time;
                    $scope.hideOverlay('OVERLAY_reportLayout');
                    $scope.gettingData = false;
                });
                break;

            case 'indicator':
                console.log('Report Type indicator');

                report_v2Model.getReport($scope.selectedReport, 'reportLayout', $scope.mode, limit).then(data => {
                    $scope.sql = data.sql;
                    $scope.time = data.time;
                    $scope.hideOverlay('OVERLAY_reportLayout');
                    $scope.gettingData = false;
                });
                break;

            default:
                break;
            }
        }
    };

    $scope.changeReportType = function (newReportType) {
        queryModel.requestCount(false);

        switch (newReportType) {
        case 'grid':
            $scope.selectedReport.reportType = 'grid';
            break;

        case 'vertical-grid':
            $scope.selectedReport.reportType = 'vertical-grid';
            break;

        case 'pivot':
            $scope.selectedReport.reportType = 'pivot';
            queryModel.requestCount(true);
            break;

        case 'chart-bar':
            $scope.selectedReport.reportType = 'chart-bar';
            break;

        case 'chart-line':
            $scope.selectedReport.reportType = 'chart-line';
            break;

        case 'chart-area':
            $scope.selectedReport.reportType = 'chart-area';
            break;

        case 'chart-donut':
            $scope.selectedReport.reportType = 'chart-donut';
            break;

        case 'indicator':
            $scope.selectedReport.reportType = 'indicator';
            if (!$scope.selectedReport.properties.style) { $scope.selectedReport.properties.style = 'style1'; }
            if (!$scope.selectedReport.properties.backgroundColor) { $scope.selectedReport.properties.backgroundColor = '#fff'; }
            if (!$scope.selectedReport.properties.reportIcon) { $scope.selectedReport.properties.reportIcon = 'fa-bolt'; }
            if (!$scope.selectedReport.properties.mainFontColor) { $scope.selectedReport.properties.mainFontColor = '#000000'; }
            if (!$scope.selectedReport.properties.descFontColor) { $scope.selectedReport.properties.descFontColor = '#CCCCCC'; }
            break;

        case 'vectorMap':
            $scope.selectedReport.reportType = 'vectorMap';
            break;

        case 'gauge':
            $scope.selectedReport.reportType = 'gauge';

            if (!$scope.selectedReport.properties.lines) { $scope.selectedReport.properties.lines = 20; } // The number of lines to draw    12
            if (!$scope.selectedReport.properties.angle) { $scope.selectedReport.properties.angle = 15; } // The length of each line
            if (!$scope.selectedReport.properties.lineWidth) { $scope.selectedReport.properties.lineWidth = 44; } // The line thickness
            if (!$scope.selectedReport.properties.pointerLength) { $scope.selectedReport.properties.pointerLength = 70; }
            if (!$scope.selectedReport.properties.pointerStrokeWidth) { $scope.selectedReport.properties.pointerStrokeWidth = 35; }
            if (!$scope.selectedReport.properties.pointerColor) { $scope.selectedReport.properties.pointerColor = '#000000'; }
            if (!$scope.selectedReport.properties.limitMax) { $scope.selectedReport.properties.limitMax = 'false'; } // If true, the pointer will not go past the end of the gauge
            if (!$scope.selectedReport.properties.colorStart) { $scope.selectedReport.properties.colorStart = '#6FADCF'; } // Colors
            if (!$scope.selectedReport.properties.colorStop) { $scope.selectedReport.properties.colorStop = '#8FC0DA'; } // just experiment with them
            if (!$scope.selectedReport.properties.strokeColor) { $scope.selectedReport.properties.strokeColor = '#E0E0E0'; } // to see which ones work best for you
            if (!$scope.selectedReport.properties.generateGradient) { $scope.selectedReport.properties.generateGradient = true; }
            if (!$scope.selectedReport.properties.minValue) { $scope.selectedReport.properties.minValue = 0; }
            if (!$scope.selectedReport.properties.maxValue) { $scope.selectedReport.properties.maxValue = 100; }
            if (!$scope.selectedReport.properties.animationSpeed) { $scope.selectedReport.properties.animationSpeed = 32; }
            break;

        default:
            // TODO signal error
            break;
        }
        // TODO: only generate the visualization not requery all data again
        $scope.getDataForPreview();
    };

    $scope.chartColumnTypeOptions = [
        {
            id: 'spline',
            name: 'Spline',
            image: 'images/spline.png',
        },
        {
            id: 'bar',
            name: 'Bar',
            icon: 'fa fa-bar-chart',
        },
        {
            id: 'area',
            name: 'Area',
            icon: 'fa fa-area-chart',
        },
        {
            id: 'line',
            name: 'Line',
            icon: 'fa fa-line-chart',
        },
        {
            id: 'area-spline',
            name: 'Area spline',
            image: 'images/area-spline.png',
        },
        {
            id: 'scatter',
            name: 'Scatter',
            image: 'images/scatter.png',
        },

    ];

    $scope.chartSectorTypeOptions = [
        {
            id: 'pie',
            name: 'Pie',
            image: 'images/pie.png'
        },
        {
            id: 'donut',
            name: 'Donut',
            image: 'images/donut.png'
        }
    ];

    $scope.changeChartColumnType = function (column, type) {
        column.type = type;
        c3Charts.transformChartColumnType($scope.selectedReport.properties.chart, column);
    };

    $scope.changeChartSectorType = function (column, type) {
        if (type === 'pie') { $scope.selectedReport.reportType = 'chart-pie'; }
        if (type === 'donut') { $scope.selectedReport.reportType = 'chart-donut'; }
        $scope.processStructure();
    };

    $scope.changeColumnStyle = function (columnIndex, hashedID) {
        report_v2Model.changeColumnStyle($scope.selectedReport, columnIndex, hashedID);
        $scope.selectedColumn = report_v2Model.selectedColumn();
        $scope.selectedColumnHashedID = report_v2Model.selectedColumnHashedID();
        $scope.selectedColumnIndex = report_v2Model.selectedColumnIndex();
    };

    $scope.changeColumnSignals = function (columnIndex, hashedID) {
        report_v2Model.changeColumnSignals($scope.selectedReport, columnIndex, hashedID);
        $scope.selectedColumn = report_v2Model.selectedColumn();
        $scope.selectedColumnHashedID = report_v2Model.selectedColumnHashedID();
        $scope.selectedColumnIndex = report_v2Model.selectedColumnIndex();
    };

    $scope.changeColumnColor = function (color) {
        if ($scope.selectedColumn.columnStyle) { $scope.selectedColumn.columnStyle.color = color; }
    };

    $scope.changeColumnBackgroundColor = function (color) {
        if ($scope.selectedColumn.columnStyle) { $scope.selectedColumn.columnStyle['background-color'] = color; }
    };

    $scope.setColumnFormat = function () {
        report_v2Model.repaintReport($scope.selectedReport);
    };

    $scope.orderColumn = function (columnIndex, desc, hashedID) {
        report_v2Model.orderColumn($scope.selectedReport, columnIndex, desc, hashedID);
    };

    $scope.reportName = function () {
        if ($scope.mode === 'add') {
            $('#theReportNameModal').modal('show');
        } else {
            $scope.reportNameSave();
        }
    };
    $scope.reportNameSave = function () {
        report_v2Model.saveAsReport($scope.selectedReport, $scope.mode, function () {
            $('#theReportNameModal').modal('hide');
            $('.modal-backdrop').hide();
            $scope.goBack();
        });
    };

    $scope.pushToDash = function () {
        var params = {};

        connection.get('/api/dashboardsv2/find-all', params, function (data) {
            $scope.dashboards = data;
            $('#dashListModal').modal('show');
        });
    };

    $scope.reportPushed2Dash = function (dashboardID) {
        $('modal-backdrop').visible = false;
        $('modal-backdrop').remove();
        $('#dashListModal').modal('hide');
        $scope.saveReportStructure();

        $location.path('/dashboardsv2/push/' + dashboardID);
    };

    $scope.aggregationChoosed = function (column, option, queryBind) {
        if (typeof column.originalLabel === 'undefined') {
            column.originalLabel = column.elementLabel;
        }

        if (option.value === 'original') {
            delete (column.aggregation);
            column.elementLabel = column.originalLabel;
            column.objectLabel = column.originalLabel;
        } else {
            column.aggregation = option.value;
            column.elementLabel = column.originalLabel + ' (' + option.name + ')';
            column.objectLabel = column.originalLabel + ' (' + option.name + ')';
        }

        queryModel.aggregationChoosed(column, option, queryBind);
    };

    $scope.hideColumn = function (column, hidden) {
        column['hidden'] = hidden;
        queryModel.hideColumn(column.elementID, hidden);
    };

    $scope.saveToExcel = function (reportHash) {
        report_v2Model.saveToExcel($scope, reportHash);
    };

    $scope.setDatePatternFilterType = function (filter, option) {
        queryModel.setDatePatternFilterType(filter, option);
    };

    $scope.getElementProperties = function (element, elementID) {
        $scope.selectedElement = element;
        $scope.tabs.selected = 'settings';
    };

    $scope.onChangeElementProperties = function () {

    };

    $scope.previewAvailable = function () {
        return $scope.selectedReport.properties.columns.length > 0 || ($scope.selectedReport.properties.ykeys.length > 0 && ($scope.selectedReport.properties.xkeys.length > 0 || ($scope.selectedReport.properties.pivotKeys.columns.length > 0 && $scope.selectedReport.properties.pivotKeys.rows.length > 0)));
    };

    $scope.gridGetMoreData = function (reportID) {
        $scope.page += 1;
        report_v2Model.getReportDataNextPage($scope.selectedReport, $scope.page);
    };

    $scope.setSortType = function (field, type) {
        field.sortType = type;
        queryModel.processStructure();
    };

    $scope.chooseRecordLimit = function () {
        if ($scope.selectedRecordLimit.value > 0) {
            $scope.selectedReport.query.recordLimit = $scope.selectedRecordLimit.value;
        }
    };

    $scope.forgetRecordLimit = function () {
        $scope.selectedRecordLimit.value = $scope.selectedReport.query.recordLimit;
        delete $scope.selectedReport.query.recordLimit;
    };
});
