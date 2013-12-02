<?php


/**
 * Implements hook_bootstrap_based_theme().
 */
function phqe_bootstrap_bootstrap_based_theme() {
  return array('phqe_bootstrap' => TRUE);
}


/**
 * Add drop down for user menu
 */
function phqe_bootstrap_menu_tree__user_menu($variables) {
    return '<div id="user-menu" class="pull-right btn-group">'
    . '<a class="btn dropdown-toggle" data-toggle="dropdown" href="#"><i class="icon-user"></i> ' . t('User menu') . ' <span class="caret"></span></a>'
    . '<ul class="dropdown-menu">' . $variables['tree'] . '</ul></div>';
}

/**
 * Add drop down for user menu
 */
/*
function phqe_bootstrap_menu_tree__user_menu($variables) {
    return user_is_logged_in() ? _phqe_bootstrap_config_logout_block_view() : _phqe_bootstrap_config_login_block_view();
}

//
function _phqe_bootstrap_config_login_block_view() {
    $content = '<ul class="nav pull-right">';
    $content .= '<li class="last leaf">';
    $content .= '<a href="/user/login">' . t('Sign in') . '</a>';
    $content .= '</li></ul>';
    return $content;
}

//
function _phqe_bootstrap_config_logout_block_view() {
    $content = '<ul class="nav pull-right">';
    $content .= '<li class="last leaf">';
    $content .= '<a href="/user/logout">' . t('Logout') . '</a>';
    $content .= '</li></ul>';
    return $content;
}
*/

/*
function phqe_bootstrap_views_view_field($vars){
  debug($vars['view']);
  if($vars['view'] === 'studies-search'){
  }
  return $vars['output'];
}
*/
/**
 * Implements template_preprocess_html()
 */
/*
function phqe_bootstrap_preprocess_html(&$variables) {
    // hide breadcrumb on home page
    if ($variables['is_front']) {
        drupal_set_breadcrumb(array());
    }
}
*/