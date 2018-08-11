$(() => {
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

    $('.remove').click((event) => {
        let parents = $(event.currentTarget).parents()
        let id = parents[2].getAttribute('data-id')
        let aliasDescription = 'from ' + parents[1].children[0].innerText
        $.confirm({
            title: 'Delete Alias!',
            content: `Are you sure you want to delete the alias ${aliasDescription}`,
            type: 'red',
            typeAnimated: true,
            backgroundDismiss: true,
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
                                    type: 'DELETE',
                                    data: {id}
                                })
                                .done(filename => {
                                    self.setType('green')
                                    self.setTitle('Success')
                                    self.setContent(`Deleted alias ${aliasDescription}!`)
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