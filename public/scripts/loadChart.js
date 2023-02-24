let current_member = {
    chart_container1: "",
    chart_container2: "",
}
let ind_employee_data = undefined


const generateChart = (container_id, canvas_id, dataset, x_axis, y_axis, legend) => {
    // resetting graph
    let container = document.getElementById(container_id)
    while (container?.firstChild) {
        container.removeChild(container.firstChild)
    }

    // getting totals for label
    let totals = () => {
        let running = 0
        for(let item in dataset){
            running += dataset[item]
        }
        return running
    }

    
    // creating new canvas
    let canvas = document.createElement('canvas')
    canvas.setAttribute('id', canvas_id)
    canvas.setAttribute('class', 'line_chart')
    container.appendChild(canvas)

    // creating a new bar chart object
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(dataset),
            datasets: [
                {
                    label: `${legend} | Total: ${totals()}`,
                    data: Object.values(dataset),
                }
            ],
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: x_axis,
                        padding: { top: 20, left: 0, right: 0, bottom: 0 }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: y_axis,
                        padding: { top: 20, left: 0, right: 0, bottom: 0 }
                    },
                    suggestedMax: 45
                }
            }
        }
    })
}

const loadEmployeeSelector = (selector_id) => {
    let selector = document.getElementById(selector_id)

    for (let member in ind_employee_data) {
        let option = document.createElement('option')
        option.text = member
        option.value = member
        selector.appendChild(option)
    }

    selector.addEventListener('change', handleChange)
    selector.removeAttribute('class', 'hidden')
}


const handleChangeDisplay = (id) => {
    let options = ['clients', 'employees', 'ind_employees']
    for(let option of options){
        if(option === id){
            let cnt = document.getElementById(`cnt_${option}`)
            cnt.removeAttribute('class', 'hidden')
        }else{
            let cnt = document.getElementById(`cnt_${option}`)
            cnt.setAttribute('class', 'hidden')
        }
    }

}


const individualEmployeeChart = (container_id, canvas_id) => {
    let curr_dataset = ind_employee_data?.[current_member[container_id]]
    
    generateChart(container_id, canvas_id, curr_dataset, 'Clients', 'Hours worked', 'Hours by client')
}

const handleChange = (e) => {
    let selector = document.getElementById(e.target.id)
    let container_id = selector.dataset.container
    let canvas_id = selector.dataset.canvas

    current_member[container_id] = e.target.value
    individualEmployeeChart(container_id, canvas_id)
}


// main script to populate displays
const populate = (data) => {
    
    // system messaging on frontend populate request
    let msg_container = document.getElementById('sys-message')
    if ((!(!!Object.keys(data).length)) || (!(!!Object.keys(data?.['client']).length)) || (!(!!Object.keys(data?.['employee']).length)) || (!(!!Object.keys(data?.['ind_employee']).length))) {
        msg_container.innerHTML = 'no data received'
        msg_container.setAttribute('class', 'sys-message fail')
        return 
    }else{
        msg_container.innerHTML = 'successfully parsed data'
        msg_container.setAttribute('class', 'sys-message success')
    }

    //loading individual employee display
    ind_employee_data = data['ind_employee']
    loadEmployeeSelector('ind_emp_selector1')
    loadEmployeeSelector('ind_emp_selector2')

    current_member['ind_emp_chart_cnt1'] = Object.keys(ind_employee_data)[0]
    current_member['ind_emp_chart_cnt2'] = Object.keys(ind_employee_data)[0]

    individualEmployeeChart('ind_emp_chart_cnt1', 'ind_emp_canvas1')
    individualEmployeeChart('ind_emp_chart_cnt2', 'ind_emp_canvas2')


    //loading clients display
    generateChart('client_chart_cnt', 'client_canvas', data['client'], 'Clients', 'Hours worked', 'Hours by client')

    //loading employee display
    generateChart('emp_chart_cnt', 'emp_canvas', data['employee'], 'Employees', 'Hours worked', 'Hours by client')

    let display_ctrl = document.getElementById('display-controls')
    display_ctrl.setAttribute('class', 'display-controls')
}