let current_member = {
    chart_container1: "",
    chart_container2: "",
}
let mem_data = undefined
const generateChart = (container_id, canvas_id) => {
    //resetting graph
    let container = document.getElementById(container_id)
    while (container?.firstChild) {
        container.removeChild(container.firstChild)

    }

    let canvas = document.createElement('canvas')
    canvas.setAttribute('id', canvas_id)
    canvas.setAttribute('class', 'line_chart')
    container.appendChild(canvas)

    let current_dataset = mem_data?.[current_member[container_id]]

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(current_dataset),
            datasets: [
                {
                    label: 'Hours by client',
                    data: Object.values(current_dataset),
                }
            ],
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Clients Worked For',
                        padding: { top: 20, left: 0, right: 0, bottom: 0 }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Hours worked',
                        padding: { top: 20, left: 0, right: 0, bottom: 0 }
                    },
                    suggestedMax: 45
                }
            }
        }
    })
}


const handleChange = (e) => {
    let selector = document.getElementById(e.target.id)
    let container_id = selector.dataset.container
    let canvas_id = selector.dataset.canvas

    current_member[container_id] = e.target.value
    generateChart(container_id, canvas_id)
}

const loadSelector = (selector_id) => {
    let selector = document.getElementById(selector_id)

    for (let member in mem_data) {
        let option = document.createElement('option')
        option.text = member
        option.value = member
        selector.appendChild(option)
    }

    selector.addEventListener('change', handleChange)
    selector.removeAttribute('class', 'hidden')
}

const populate = (data) => {
    mem_data = data

    if(!(!!Object.keys(data).length)) return console.log('no data received')

    loadSelector('selector1')
    loadSelector('selector2')

    current_member['chart_container1'] = Object.keys(data)[0]
    current_member['chart_container2'] = Object.keys(data)[0]

    generateChart('chart_container1', 'canvas1')
    generateChart('chart_container2', 'canvas2')
}