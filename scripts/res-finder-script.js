$(() => {
    let form = $('#form')
    let submit = $('#submit')

    //dropdown animation
    $('.dropdown').on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
    });
      
    $('.dropdown').on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });
    //dropdown animation

    function getParent () {
        let selected = form.find('option:selected')
        let n = selected.length -1
        if($(selected[n]).val() == '')
            n--
        return $(selected[n])
    }

    submit.click(() => {
        let parent = getParent()
        if(!parent.data('isTerminal'))
            return $.alert({
                title: 'Error',
                backgroundDismiss: true,
                content:'You can only view files for a terminal node!'
            })
        window.location.href = `/files/${parent.data('id')}`
    })

    function addToList (data) {
        if(typeof data.label == 'undefined')
            return
        let div = $('<div>').toggleClass('form-group')
        .append(
            $('<label>')
            .text(data.label)
        )
        let op = $('<select>')
        .attr('name',data.label)
        .toggleClass('form-control')
        .append(
            $('<option>').attr({
                'selected': 'true',
                'disabled': 'true',
            })
        )
        .change(function () {
            $(this).parent().nextAll().each(function () {$(this).remove()})
            let ele = $('option:selected',this)
            if(ele.data('isTerminal'))
                return
            let objID = ele.data('id')
            $.get(`/items/${objID}`).done(data => addToList(data))
        })
        if(typeof data.options == 'object'){
            for(x of data.options){
                op.append(
                    $('<option>')
                    .attr('value',`${x.name}`)
                    .text(`${x.name}`)
                    .data({
                        'id':x.id,
                        'isTerminal':x.isTerminal
                    })
                )
            }
        }
        div.append(op)
        form.append(div)
    }
    $.get('/items/root').done((data) => {
        addToList(data)
    })
    
})