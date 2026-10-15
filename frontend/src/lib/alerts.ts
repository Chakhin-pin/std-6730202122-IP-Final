import {Alert,Platform} from 'react-native';
export function notify(title:string,message:string){if(Platform.OS==='web')window.alert(`${title}\n${message}`);else Alert.alert(title,message);}
export function confirmDelete(name:string,run:()=>void){
 if(Platform.OS==='web'){if(window.confirm(`Are you sure?\nลบ ${name}?`))run();return;}
 Alert.alert('Are you sure?',`ลบ ${name}?`,[{text:'ยกเลิก',style:'cancel'},{text:'Delete',style:'destructive',onPress:run}]);
}
