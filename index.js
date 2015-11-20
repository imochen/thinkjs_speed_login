'use strict';

/**
 * [higo speed login]
 * appid : 应用ID,
 * appsecret : 密钥,
 * http : 此处请将thinkjs的http对象传过来,
 * redirect_uri : 授权后重定向地址,
 * authorize_url : 授权接口地址,
 * access_token_url : 获取token接口地址,
 * check_token_url : 检查token是否可发，这一步已经可以得到用户信息了。
 */
export default function( config ){

	import urllib from 'urllib';

	let http = config.http;
	let code = http.get('code');

	let appid = config.appid;
	let appsecret = config.appsecret;
	let redirect_uri = config.redirect_uri;

	let urls = {
		authorize : config.authorize_url,
		access_token : config.access_token_url,
		check_token : config.check_token_url
	}

	let post = ( url , data , errmsg ) => {

		return new Promise(( resolve , reject ) => {
			urllib.request( url , {
				method : 'POST',
				timeout : config.timeout || 10000,
				data : data
			}, ( err , data , res ) =>{
				if( !err && res.status === 200){
					resolve( JSON.parse(data.toString()));
				}else{
					reject( errmsg || err );
				}
			})

		});

	}

	if( !code ){
		http.session('speed_login', 1 );
		http.redirect( urls.authorize + '?client_id=' + appid + '&response_type=code&redirect_uri=' + encodeURIComponent( redirect_uri ) );
	}else{
		return new Promise(( resolve , reject) => {
			post( urls.access_token , {
				client_id : appid,
				client_secret : appsecret,
				grant_type : 'authorization_code',
				redirect_uri : encodeURIComponent( redirect_uri ),
				code : code
			}).then(( data )=>{
				return post( urls.check_token, {
					client_id : appid,
					access_token : data.access_token
				});
			}).then(( data )=>{
				resolve( data.data );
			}).catch(( err )=>{
				reject( err );
			})
		});
	}

}