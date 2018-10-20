// test/test.js
Page({

    /**
     * 页面的初始数据
     */
	data: {
		html: '<p class="xing-p"></p>',

		//内容输出格式，参考rich-text组件，默认为节点列表
		outputType: 'html',
		buttonBackgroundColor: '#409EFF',
		buttonTextColor: '#fff',
	},

    /**
     * 生命周期函数--监听页面加载
     */
	onLoad: function (options) {
		var that = this
		const {
			windowHeight
		} = wx.getSystemInfoSync();
		this.setData({
			windowHeight,
		})
		if (that.data.nodes && that.data.nodes.length > 0) {
			console.log("if")
			const textBufferPool = [];
			that.properties.nodes.forEach((node, index) => {
				if (node.name === 'p') {
					textBufferPool[index] = node.children[0].text;
				}
			})
			that.setData({
				textBufferPool,
				nodeList: this.properties.nodes,
			})
		} else if (that.data.html) {
			console.log("elseif")
			const nodeList = that.HTMLtoNodeList();
			const textBufferPool = [];
			nodeList.forEach((node, index) => {
				if (node.name === 'p') {
					textBufferPool[index] = node.children[0].text;
				}
			})
			that.setData({
				textBufferPool,
				nodeList,
			})
		}
	},


	addText: function (e) {
		this.writeTextToNode();
		const index = e.currentTarget.dataset.index;
		const node = {
			name: 'p',
			attrs: {
				class: 'xing-p',
			},
			children: [{
				type: 'text',
				text: ''
			}]
		}
		const nodeList = this.data.nodeList;
		const textBufferPool = this.data.textBufferPool;
		nodeList.splice(index + 1, 0, node);
		textBufferPool.splice(index + 1, 0, '');
		this.setData({
			nodeList,
			textBufferPool,
		})
	},

    /**
     * 事件：添加图片
     */
	addImage: function (e) {
		this.writeTextToNode();
		const index = e.currentTarget.dataset.index;
		wx.chooseImage({
			success: res => {
				const tempFilePath = res.tempFilePaths[0];
				//上传图片，用返回的图片路劲替换展示的图片路劲
				wx.uploadFile({
					url: 'http://localhost:3009/uploadimage',
					filePath: tempFilePath,
					name: "image",
					success:function(res){
						console.log(res.data)
						var data = JSON.parse(res.data)

						console.log(data.TempImageUri)
					}
				})
				wx.getImageInfo({
					src: tempFilePath,
					success: res => {
						const node = {
							name: 'img',
							attrs: {
								class: 'xing-img',
								src: tempFilePath,
								_height: res.height / res.width,
							},
						}
						let nodeList = this.data.nodeList;
						let textBufferPool = this.data.textBufferPool;
						nodeList.splice(index + 1, 0, node);
						textBufferPool.splice(index + 1, 0, tempFilePath);
						this.setData({
							nodeList,
							textBufferPool,
						})
					}
				})
			},
		})
	},

    /**
     * 事件：删除节点
     */
	deleteNode: function (e) {
		this.writeTextToNode();
		const index = e.currentTarget.dataset.index;
		let nodeList = this.data.nodeList;
		let textBufferPool = this.data.textBufferPool;
		nodeList.splice(index, 1);
		textBufferPool.splice(index, 1);
		this.setData({
			nodeList,
			textBufferPool,
		})
	},

    /**
     * 事件：文本输入
     */
	onTextareaInput: function (e) {
		const index = e.currentTarget.dataset.index;
		let textBufferPool = this.data.textBufferPool;
		textBufferPool[index] = e.detail.value;
		this.setData({
			textBufferPool,
		})
	},
    /**
     * 方法：将HTML转为节点
     */
	HTMLtoNodeList: function () {
		var that = this
		let html = this.data.html;
		let htmlNodeList = [];
		while (html.length > 0) {
			const endTag = html.match(/<\/[a-z0-9]+>/);
			if (!endTag) break;
			const htmlNode = html.substring(0, endTag.index + endTag[0].length);
			htmlNodeList.push(htmlNode);
			html = html.substring(endTag.index + endTag[0].length);
		}
		return htmlNodeList.map(htmlNode => {
			let node = {
				attrs: {}
			};
			const startTag = htmlNode.match(/<[^<>]+>/);
			const startTagStr = startTag[0].substring(1, startTag[0].length - 1).trim();
			node.name = startTagStr.split(/\s+/)[0];
			startTagStr.match(/[^\s]+="[^"]+"/g).forEach(attr => {
				const [name, value] = attr.split('=');
				node.attrs[name] = value.replace(/"/g, '');
			})
			if (node.name === 'p') {
				const endTag = htmlNode.match(/<\/[a-z0-9]+>/);
				const text = that.htmlDecode(htmlNode.substring(startTag.index + startTag[0].length, endTag.index).trim());
				node.children = [{
					text,
					type: 'text',
				}]
			}
			return node;
		})
	},
    /**
     * 方法：HTML转义
     */
	htmlDecode: function (str) {
		var s = "";
		if (str.length == 0) return "";
		s = str.replace(/&gt;/g, "&");
		s = s.replace(/&lt;/g, "<");
		s = s.replace(/&gt;/g, ">");
		s = s.replace(/&nbsp;/g, " ");
		s = s.replace(/&#39;/g, "\'");
		s = s.replace(/&quot;/g, "\"");
		s = s.replace(/<br>/g, "\n");
		return s;
	},
    /**
     * 方法：将节点转为HTML
     */
	nodeListToHTML: function () {
		return this.data.nodeList.map(node => `<${node.name} ${Object.keys(node.attrs).map(key => `${key}="${node.attrs[key]}"`).join(' ')}>${node.children ? this.htmlEncode(node.children[0].text) : ''}</${node.name}>`).join('');
	},

    /**
     * 方法：上传图片
     */
	uploadImage: function (node) {
		return new Promise(resolve => {
			let options = {
				filePath: node.attrs.src,
				url: this.properties.imageUploadUrl,
				name: this.properties.imageUploadName,
			}
			if (this.properties.imageUploadHeader) {
				options.header = this.properties.imageUploadHeader;
			}
			if (this.properties.imageUploadFormData) {
				options.formData = this.properties.imageUploadFormData;
			}
			options.success = res => {
				const keyChain = this.properties.imageUploadKeyChain.split('.');
				let url = JSON.parse(res.data);
				keyChain.forEach(key => {
					url = url[key];
				})
				node.attrs.src = url;
				node.attrs._uploaded = true;
				resolve();
			}
			wx.uploadFile(options);
		})
	},

    /**
     * 方法：处理节点，递归
     */
	handleOutput: function (index = 0) {
		var that = this
		let nodeList = this.data.nodeList;
		if (index >= nodeList.length) {
			wx.hideLoading();
			if (this.data.outputType.toLowerCase() === 'array') {
				console.log(that.data.nodeList)
				// that.triggerEvent('finish', { content: this.data.nodeList });
			}
			if (this.data.outputType.toLowerCase() === 'html') {
				// that.triggerEvent('finish', { content: this.nodeListToHTML() });
				console.log(that.nodeListToHTML())
			}
			return;
		}
		const node = nodeList[index];
		if (node.name === 'img' && !node.attrs._uploaded) {
			this.uploadImage(node).then(() => {
				this.handleOutput(index + 1)
			});
		} else {
			this.handleOutput(index + 1);
		}
	},
    /**
     * 方法：将缓冲池的文本写入节点
     */
	writeTextToNode: function (e) {
		const textBufferPool = this.data.textBufferPool;
		const nodeList = this.data.nodeList;
		nodeList.forEach((node, index) => {
			if (node.name === 'p') {
				node.children[0].text = textBufferPool[index];
			}
		})
		this.setData({
			nodeList,
		})
	},
    /**
     * 事件：提交内容
     */
	onFinish: function (e) {
		wx.showLoading({
			title: '正在保存',
		})
		this.writeTextToNode();
		this.handleOutput();
	},

    /**
     * 方法：HTML转义
     */
	htmlEncode: function (str) {
		var s = "";
		if (str.length == 0) return "";
		s = str.replace(/&/g, "&gt;");
		s = s.replace(/</g, "&lt;");
		s = s.replace(/>/g, "&gt;");
		s = s.replace(/ /g, "&nbsp;");
		s = s.replace(/\'/g, "&#39;");
		s = s.replace(/\"/g, "&quot;");
		s = s.replace(/\n/g, "<br>");
		return s;
	},
	// 点击预览事件
	onPreview: function (e) {
		var that = this;
		wx.showLoading({
			title: '正在加载...',
		})
		this.writeTextToNode();
		this.handleOutput();
		var description
		// 确定描述是什么
		if (this.data.outputType.toLowerCase() === 'array') {
			description = that.data.nodeList
		}
		if (this.data.outputType.toLowerCase() === 'html') {
			description = that.nodeListToHTML()
		}

		var questionContent = {
			title: that.data.questionTitle,
			description: description
		};
		wx.setStorage({
			key: "questionContent",
			data: questionContent
		})
		wx.hideLoading()
		wx.navigateTo({
			url: '../preview/preview'
		})
	},
	// 标题输入框输入事件
	onTitleInput: function (e) {
		this.setData({
			questionTitle: e.detail.value
		})
	}
})