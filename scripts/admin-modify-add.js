$(() => {
    let form = $('#form')
    let label = $('#label')
    let deleteBtn = $('#deleteBtn')
    let addLabelForm = $('#addLabelForm')
    //dropdown animation
    $('.dropdown').on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
    });
      
    $('.dropdown').on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });
    //dropdown animation
    function getPID () {
        let selected = form.find('option:selected')
        let n = selected.length -1
        if($(selected[n]).val() == '')
            n--
        return $(selected[n]).data('id')
    }
    function assignLabel() {
        let selected = form.find('option:selected')
        let n = selected.length -1
        let lastItem = $(selected[n])
        if(lastItem.val() == ''){
            label.val(lastItem.parent().prev().text())
            label.prop('readonly',true)
        }
        else{
            label.val('')
            label.prop('readonly',false)
        }
    }
    addLabelForm.submit(function (e) {
        e.preventDefault()
        let formData = $(this).serializeArray()
        .reduce((obj, item) => {
            obj[item.name] = item.value.trim();
            return obj;
        }, {parentID: getPID()})
        $.alert({
            content: function () {
                var self = this;
                return $.ajax({
                    url:'/admin/items',
                    type: 'POST',
                    data:formData
                }).done(data => {
                    self.setTitle('Success')
                    self.setType('green')
                    self.setContent(`Added ${data.name} under ${data.label}`)
                })
                .fail(() => {
                    self.setTitle('Error')
                    self.setType('red')
                    self.setContent('Something went wrong.')
                })
            },
            onClose: function () {window.location.reload()}
        })
    })
    deleteBtn.click(function (e) {
        e.preventDefault()
        console.log('clicked!')
        let selected = form.find('option:selected')
        let n = selected.length -1
        if($(selected[n]).val() == '')
            n--
        let child = selected[n]
        let parent = selected[n-1]
        let labelName = $(child).parent().prev().text()
        console.log(`${child.innerText} from ${labelName}`)
        $.confirm({
            title: 'Delete Label!',
            content: `Are you sure you want to delete ${child.innerText} from ${labelName}.
            All child nodes will also be deleted.
            `,
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
                                    url: '/admin/items',
                                    type: 'DELETE',
                                    data: {child: $(child).data('id'),parent: $(parent).data('id')}
                                }).done(data => {
                                    self.setTitle('Success')
                                    self.setType('green')
                                    self.setContent(`Deleted ${data.name} form ${data.label}`)
                                })
                                .fail((e) => {
                                    self.setTitle('Error')
                                    self.setType('red')
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
        if(!data.label)
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
            $(this).parent().nextAll().each(function () {
                $(this).remove()
            })
            let ele = $('option:selected',this)
            if(ele.data('isTerminal'))
                return
            let objID = ele.data('id')
            $.get(`/items/${objID}`).done((data) => {
                addToList(data)
                assignLabel()
            })
            .fail(e => console.error(e)) 
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
        assignLabel()
    })
    
})