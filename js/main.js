var params = {
    apiBaseURL: 'https://avoindata.prh.fi/tr/v1/publicnotices',
    tableId: 'resultTable',
    startDateInputId: 'startDate',
    endDateInputId: 'endDate',
};
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages': ['table']});
google.charts.setOnLoadCallback(drawInitialTable);

var data;
var table;

function drawInitialTable() {
    drawTable(params.tableId, createTableDataObject());
}

function drawTable (tableId, data) {
    table = new google.visualization.Table(document.getElementById(tableId));
    table.draw(data, {width: '100%', height: '100%', sortColumn: 2, sortAscending: true});
};

function createTableDataObject  () {
    data = new google.visualization.DataTable();

    data.addColumn('string', 'Business id');
    data.addColumn('string', 'Company name');
    data.addColumn('string', 'Bankruptcy date');

    return data;
};

function clearTableRows (tableId) {
    $("#" + tableId).find('tbody').remove();
    $("#" + tableId).append('<tbody></tbody>');
};

function addEntryRowToTable (entry, tableData) {
    tableData.addRow([entry.businessId, entry.name, entry.registrationDate]);
};

function getBankruptcies () {
    var tableId = params.tableId;
    $('#resultCount').text("");
    $.ajax({
        type: 'GET',
        url: getFullUrl(1, $('#startDate').val(), $('#endDate').val()),
        dataType: 'json',
        success: function (response) {
            $.ajax({
                type: 'GET',
                url: getFullUrl(response.totalResults, $('#startDate').val(), $('#endDate').val()),
                dataType: 'json',
                success: function (response) {
                    clearTableRows(tableId);
                    var tableData = createTableDataObject();
                    $.each(response.results, function (index, entry) {
                        addEntryRowToTable(entry, tableData);
                    });
                    drawTable(tableId, tableData);
                    $('#resultCount').text("Total number of results: " + response.totalResults);
                },
                error: function (error) {
                    swal('Error when loading bankruptcies', 'Error message: ' + JSON.stringify(error), 'error');
                    console.log(error);
                }

            });
        },
        error: function (error) {
            swal('Error when loading bankruptcies', 'Error message: ' + JSON.stringify(error), 'error');
            console.log(error);
        }

    });


};

function getFullUrl(numberOfResults, startDate, endDate) {
    var fullUrl = params.apiBaseURL + "?totalResults=true";
    fullUrl += "&entryCode=KONALK";
    if (numberOfResults !== undefined && numberOfResults !== null) {
        fullUrl += "&maxResults=" + numberOfResults;
    }
    if (startDate !== undefined && startDate !== null && startDate.length > 0) {
        fullUrl += "&noticeRegistrationFrom=" + startDate;
    }
    if (endDate !== undefined && endDate !== null && endDate.length > 0) {
        fullUrl += "&noticeRegistrationTo=" + endDate;
    }
    return fullUrl;
}

function exportTableToCSV() {
    var csvHeader = "Business id,Company name,Bankruptcy date\r\n";
    var csv = google.visualization.dataTableToCsv(data);
    downloadCSV(csvHeader + csv);
}

function downloadCSV (csv_out) {
    var blob = new Blob([csv_out], {type: 'text/csv;charset=utf-8'});
    var url  = window.URL || window.webkitURL;
    var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    link.href = url.createObjectURL(blob);
    link.download = "bankruptcies.csv";

    var event = document.createEvent("MouseEvents");
    event.initEvent("click", true, false);
    link.dispatchEvent(event);
}
