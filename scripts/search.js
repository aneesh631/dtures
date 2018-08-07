$(() => {
    let search = $('#search');
    search.on('change paste keyup',() => {
        let txt = search.val();
        if(txt!=''){
            $.ajax({
                'url':`/autocomplete/${txt}`,
                type: 'GET'
            }).done(data => {
                search.autocomplete({source: data});
            })
        }
    })
})