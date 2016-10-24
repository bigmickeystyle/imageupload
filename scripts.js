$('#submit').click(function(e){
    e.preventDefault();
    console.log("clicked");
    var file = $('input[type="file"]').get(0).files[0];

    var formData = new FormData();
    formData.append('file', file);

    $.ajax({
        url: '/upload',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
            console.log(data);
            $('body').append("<img src=" + data.file + "></img>");
        }
    });
});

$('#submit-url').click(function(e){
    e.preventDefault();
    $.ajax({
        url: '/uploadurl',
        method: 'POST',
        data: {
            url: $('#url').val()
        },
        success: function(data){
            console.log(data);
            $('body').append("<img src=" + data.file + "></img>");
        }
    });
});
