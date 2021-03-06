import React, { Component } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskControl from './components/TaskControl';
import TaskList from './components/TaskList';
import { findIndex } from 'lodash';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tasks: [],
			isDisplayForm: false,
			taskEditteing: null,
			filter: {
				name: '',
				status: -1
			},
			keyword: '',
			sortBy: 'name',
			sortValue: 1
		}
	}

	componentWillMount() {
		if(localStorage && localStorage.getItem('tasks')) {
			const tasks = JSON.parse(localStorage.getItem('tasks'));
			this.setState({
				tasks : tasks
			})

		}
	}

	s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}

	generateID() {
		return this.s4() + this.s4() + this.s4() + '-' + this.s4() + this.s4() + this.s4() + 
		this.s4() + this.s4() + this.s4() + '-' + this.s4() + this.s4() + this.s4() ; 
	}

	onToggleForm = () => {

		if( this.state.isDisplayForm ) {
			this.setState({
				isDisplayForm: true,
				taskEditteing: null
			})
		} else {
			this.setState({
				isDisplayForm: !this.state.isDisplayForm,
				taskEditteing: null
			})
		}

	}

	onCloseForm = () => {
		this.setState({
			isDisplayForm: false
		})
	}

	onShowForm = () => {
		this.setState({
			isDisplayForm: true
		})
	}

	onSubmit = (data) => {
		let { tasks } = this.state;

		if (data.id === '') {
			data.id = this.generateID();
			tasks.push(data);
		} else {
			const index = this.findIndex(data.id);
			tasks[index] = data
		}
		this.setState({
			tasks : tasks
		})
		
		localStorage.setItem('tasks', JSON.stringify(tasks))
		
	}

	onUpdateStatus = (id) => {
		const { tasks } = this.state;
		// const index = this.findIndex(id);
		const index = findIndex(tasks, (task) => {
			return task.id === id
		})
		if( index !== -1) {
			tasks[index].status = !tasks[index].status
			this.setState({
				tasks: tasks
			})
			localStorage.setItem('tasks', JSON.stringify(tasks));
		}


	}

	onDelete = (id) => {
		const { tasks } = this.state;
		const index = this.findIndex(id);
		if ( index !== -1) {
			tasks.splice(index, 1);
			this.setState({
				tasks: tasks
			})
			localStorage.setItem('tasks', JSON.stringify(tasks));
		}

		this.onCloseForm();

	}

	onUpdate = (id) => {
		this.onShowForm();
		const { tasks } = this.state;
		const index = this.findIndex(id);
		if ( index !== -1) {
			const taskEditteing = tasks[index];
			this.setState({
				taskEditteing: taskEditteing
			})
		}
	}

	findIndex = (id) => {
		const { tasks } = this.state;
		let result = -1;
		tasks.forEach(( task, index ) => {
			if(task.id === id) {
				result = index;
			}
		})
		return result
	}

	onFilter = (filterName, filterStatus) => {

		filterStatus = parseInt(filterStatus, 10);

		this.setState({
			filter: {
				name: filterName.toLowerCase(),
				status: filterStatus
			}
		})
	}

	onSearch = (keyword) => {
		if (keyword) {
			this.setState({
				keyword: keyword.toLowerCase()
			})
		}
	}

	onSort = (sortBy, sortValue) => {
		if(sortBy && sortValue) {
			this.setState({
				sortBy: sortBy,
				sortValue: sortValue
			})
		}  
	}

    render() {
    	let { tasks, isDisplayForm, taskEditteing, filter, keyword, sortBy, sortValue } = this.state

    	if( filter ) {
    		if(filter.name) {
    			tasks = tasks.filter((task) => {
    				return task.name.toLowerCase().indexOf(filter.name) !== -1;
    			})
    		}

    		tasks = tasks.filter((task) => {
    			if(filter.status === -1) {
    				return task
    			} else {
    				return task.status === (filter.status === 1 ? true : false)
    			}
    		})
    	}

    	if ( keyword ) {
    		tasks = tasks.filter((task) => {
    			return task.name.toLowerCase().indexOf(keyword) !== -1;
    		})
    	}

    	if ( sortBy === 'name') {
	    	tasks.sort((a,b) => {
	    		if (a.name > b.name) return sortValue
	    		else if (a.name < b.name) return -sortValue
	    		else return 0
	    	})
    	} else {
			tasks.sort((a,b) => {
    		if (a.status > b.status) return -sortValue
    		else if (a.status < b.status) return sortValue
    		else return 0
	    	})
    	}


    	var elmForm = isDisplayForm ? 
	    					<TaskForm 
	    						onCloseForm = { this.onCloseForm } 
	    						onSubmit={ this.onSubmit }
	    						task = { taskEditteing  }
	    					/> :
	    					 '';
        return (
        	<div className="container">
        		<div className="text-center">
                    <h1>Quản Lý Công Việc</h1><hr/>
                </div>
                <div className="row">
                    <div 
                    	className= { isDisplayForm ? 
                    				'col-xs-12 col-sm-12 col-md-4 col-lg-4' : 
                    				'' }>
                    	{/*form*/}
                    	{ elmForm }
                    </div>
                    <div 
                    	className= { isDisplayForm ? 
                    				'col-xs-12 col-sm-12 col-md-8 col-lg-8' : 
                    				'col-xs-12 col-sm-12 col-md-12 col-lg-12'}>

                        <button 
	                        type="button" 
	                        className="btn btn-primary"
	                        onClick={ this.onToggleForm }>
                            <span className="fa fa-plus mr-5"></span>
                            Thêm Công Việc
                        </button>

                        {/*search - sort*/}
                        <TaskControl
                        	onSearch = { this.onSearch }
                        	sortBy = { sortBy }
                        	sortValue = { sortValue }
                        	onSort = { this.onSort }
                        />
			            <div className="row mt-15">
			                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
			                	<TaskList
			                		tasks = { tasks }
			                		onUpdateStatus = { this.onUpdateStatus }
			                		onDelete = { this.onDelete }
			                		onUpdate = { this.onUpdate }
			                		onFilter = { this.onFilter }
			                	/>
			                </div>
			            </div>
                    </div>
                </div>
            </div>
        		
        )
    }
}

export default App;
