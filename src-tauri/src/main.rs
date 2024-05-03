// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use llama3::{auto_device, ChatConfig, DType, LlamaChat, Message, Role};
use std::sync::Mutex;

#[tauri::command]
async fn process(state: tauri::State<'_, Mutex<State>>, msg: &str) -> Result<String, ()> {
    let mut state = state.lock().unwrap();

    // Update conversation
    state.messages.push(Message {
        role: Role::User,
        content: msg.to_owned(),
    });
    let prompt = state.llm.encode(&state.messages);

    // Generation
    state.llm.generate(&prompt).unwrap();
    let mut response = String::new();
    for r in &mut state.llm.into_iter() {
        response.push_str(&r.unwrap());
    }

    // Update conversation
    state.messages.push(Message {
        role: Role::Assistant,
        content: response.clone(),
    });
    Ok(response)
}

fn init_llm() -> LlamaChat {
    let model_path: &str = "/home/robin/hdd/Meta-Llama-3-8B-Instruct";

    // Setup config
    let config = ChatConfig {
        use_flash_attn: true,
        use_kv_cache: true,
        temperature: 0.8,
        top_p: 0.9,
        seed: 299792458,
        device: auto_device(),
        dtype: DType::BF16,
        repeat_penalty: 1.1,
        repeat_last_n: 128,
        eos_token: Some("<|eot_id|>".to_string()),
        max_context_length: 8192,
    };

    LlamaChat::new(model_path, &config).unwrap()
}

// App state
struct State {
    pub llm: LlamaChat,
    pub messages: Vec<Message>,
}

fn main() {
    let init_msgs = vec![Message {
        role: Role::System,
        content: "You are a helpful assistant.".to_string(),
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![process])
        .manage(Mutex::new(State {
            llm: init_llm(),
            messages: init_msgs,
        }))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
