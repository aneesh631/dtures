$(() => {
    let form = $('#form')
    let addAlias = $('#addAlias')
    let deleteAlias = $('#deleteAlias')
    let from = undefined
    let to = undefined

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

    addAlias.click(() => {
        let parent = getParent()
        if(!from){
            from = {
                id: parent.data('id'),
                label: parent.parent().attr('name'),
                name: parent.val()
            }
            $.confirm({
                title: 'Add Alias',
                content:`Are you sure you want to add an alias to ${from.label}:${from.name}`,
                buttons: {
                    ok: function () {
                        form.empty()
                        $.get('/items/root').done((data) => {
                            addToList(data)
                        })
                    },
                    cancel: function () {}
                }
            })
        }
        else {
            to = {
                id: parent.data('id'),
                label: parent.parent().attr('name'),
                name: parent.val()
            }
            console.log('from: ',from)
            console.log('to: ',to)
            $.confirm({
                title: 'Add Alias',
                content:`Are you sure you want to add an alias form ${from.label}:${from.name} to ${to.label}:${to.name}`,
                buttons: {
                    confirm: {
                        text: 'Confirm',
                        btnClass: 'btn-red',
                        action: function () {
                            $.alert({
                                content: function () {
                                    var self = this;
                                    return $.ajax({
                                        url: '/admin/alias',
                                        type: 'POST',
                                        data: {from: from.id,to: to.id}
                                    })
                                    .done(() => {
                                        self.setType('green')
                                        self.setTitle('Success')
                                        self.setContent(`Added alias form ${from.label}:${from.name} to ${to.label}:${to.name}!`)
                                    })
                                    .fail(() => {
                                        self.setType('red')
                                        self.setTitle('Error')
                                        self.setContent('Something went wrong.')
                                    })
                                },
                                onClose: function () {window.location.reload()}
                            })
                        }
                    },
                    cancel: function () {}
                }
            })
        }
        // window.location.href = `/admin/files/${parent.data('id')}`
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