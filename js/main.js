var params = {
    apiBaseURL: 'https://avoindata.prh.fi/tr/v1/publicnotices',
    tableId: 'resultTable',
    startDateInputId: 'startDate',
    endDateInputId: 'endDate',
};

// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages': ['table']});

function drawTable (tableId, data) {
    var table = new google.visualization.Table(document.getElementById(tableId));
    table.draw(data, {width: '100%', height: '100%', sortColumn: 2, sortAscending: true});
};

function createTableDataObject  () {
    var data = new google.visualization.DataTable();

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
    clearTableRows(tableId);
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
